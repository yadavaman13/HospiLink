const nodemailer = require('nodemailer');
const config = require('../config/config');

function createTransporter() {
    if (config.GOOGLE_USER && config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_REFRESH_TOKEN) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.GOOGLE_USER,
                clientId: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                refreshToken: config.GOOGLE_REFRESH_TOKEN
            }
        });
    }

    if (config.EMAIL_USER && config.EMAIL_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASSWORD
            }
        });
    }

    return null;
}

const transporter = createTransporter();

if (transporter) {
    transporter.verify((error) => {
        if (error) {
            console.error('Error connecting to email server:', error);
        } else {
            console.log('Email server is ready to send mail');
        }
    });
}

async function sendEmail(to, subject, text, html) {
    if (!transporter) {
        throw new Error('Email service is not configured');
    }

    const fromAddress = config.GOOGLE_USER || config.EMAIL_USER;

    const info = await transporter.sendMail({
        from: `"${config.EMAIL_FROM_NAME}" <${fromAddress}>`,
        to,
        subject,
        text,
        html
    });

    console.log('Message sent:', info.messageId);
    return info;
}

async function sendHospitalAdminCredentialsEmail({ to, hospitalName, hospitalId, email, password, loginUrl }) {
    const subject = `HospiLink hospital admin login credentials - ${hospitalName}`;
    const text = [
        `Your HospiLink hospital admin account has been created for ${hospitalName}.`,
        `Hospital ID: ${hospitalId}`,
        `Email: ${email}`,
        `Temporary Password: ${password}`,
        `Login URL: ${loginUrl}`,
        '',
        'Please sign in and change your password from your profile immediately after first login.'
    ].join('\n');

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
            <h2>HospiLink Hospital Admin Account</h2>
            <p>Your hospital registration has been received and your admin credentials are ready.</p>
            <p><strong>Hospital:</strong> ${hospitalName}</p>
            <p><strong>Hospital ID:</strong> ${hospitalId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
            <p><strong>Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            <p>Please change your password from your profile after you sign in.</p>
        </div>
    `;

    return sendEmail(to, subject, text, html);
}

async function sendAppointmentConfirmationEmail({ patientEmail, patientName, doctorName, specialization, appointmentDate, timeSlot, hospitalName, consultationFee, isDoctorEmail = false }) {
    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const subject = isDoctorEmail 
        ? `New Appointment Booking - ${patientName} on ${formattedDate}`
        : `Appointment Confirmed - ${doctorName} on ${formattedDate}`;

    const text = isDoctorEmail
        ? `You have a new appointment booking from ${patientName} on ${formattedDate} at ${timeSlot}`
        : `Your appointment with ${doctorName} (${specialization}) has been confirmed for ${formattedDate} at ${timeSlot}`;

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
            <h2>${isDoctorEmail ? 'New Appointment Booking' : 'Appointment Confirmed'}</h2>
            <p>Your appointment has been successfully booked!</p>
            
            <div style="background-color:#f0f9ff;padding:15px;border-radius:5px;margin:20px 0">
                ${!isDoctorEmail ? `
                    <p><strong>Doctor:</strong> ${doctorName} (${specialization})</p>
                ` : `
                    <p><strong>Patient:</strong> ${patientName}</p>
                `}
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${timeSlot}</p>
                <p><strong>Hospital:</strong> ${hospitalName}</p>
                ${consultationFee > 0 ? `<p><strong>Consultation Fee:</strong> ₹${consultationFee}</p>` : ''}
            </div>
            
            ${!isDoctorEmail ? `
                <p><strong>Important:</strong> Please arrive 10 minutes before your appointment time.</p>
                <p>You will receive a reminder email 24 hours before your appointment.</p>
            ` : `
                <p>Please review your schedule and prepare for this appointment.</p>
            `}
            
            <p>Thank you for using HospiLink!</p>
        </div>
    `;

    return sendEmail(patientEmail, subject, text, html);
}

async function sendAppointmentCancellationEmail({ patientEmail, patientName, doctorName, appointmentDate, timeSlot, reason }) {
    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const subject = `Appointment Cancelled - ${doctorName}`;
    const text = `Your appointment with ${doctorName} on ${formattedDate} at ${timeSlot} has been cancelled. Reason: ${reason}`;

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
            <h2 style="color:#dc2626">Appointment Cancelled</h2>
            <p>Your appointment has been cancelled.</p>
            
            <div style="background-color:#fee2e2;padding:15px;border-radius:5px;margin:20px 0">
                <p><strong>Doctor:</strong> ${doctorName}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${timeSlot}</p>
                <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p>You can book a new appointment at your convenience through the HospiLink app.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    `;

    return sendEmail(patientEmail, subject, text, html);
}

async function sendDoctorCredentialsEmail({ to, firstName, lastName, hospitalName, email, password, hospitalId, loginUrl }) {
    const subject = `Welcome to HospiLink - Your Doctor Account Credentials`;
    const text = [
        `Dear Dr. ${lastName},`,
        '',
        `Welcome to HospiLink! Your doctor account has been created for ${hospitalName}.`,
        '',
        `Hospital: ${hospitalName}`,
        `Hospital ID: ${hospitalId}`,
        `Email: ${email}`,
        `Temporary Password: ${password}`,
        `Login URL: ${loginUrl}`,
        '',
        'Please sign in and change your password from your profile settings immediately after first login.',
        'Set up your availability schedule to start accepting appointments.'
    ].join('\n');

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
            <h2>Welcome to HospiLink</h2>
            <p>Dear Dr. ${lastName},</p>
            <p>Your doctor account has been successfully created!</p>
            
            <div style="background-color:#f0f9ff;padding:15px;border-radius:5px;margin:20px 0">
                <p><strong>Hospital:</strong> ${hospitalName}</p>
                <p><strong>Hospital ID:</strong> ${hospitalId}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <code style="background-color:#e5e7eb;padding:2px 6px">${password}</code></p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li><a href="${loginUrl}">Login to your account</a></li>
                <li>Change your password</li>
                <li>Set up your weekly availability schedule</li>
                <li>Complete your doctor profile</li>
                <li>Start accepting appointments!</li>
            </ol>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
        </div>
    `;

    return sendEmail(to, subject, text, html);
}

module.exports = {
    sendEmail,
    sendHospitalAdminCredentialsEmail,
    sendAppointmentConfirmationEmail,
    sendAppointmentCancellationEmail,
    sendDoctorCredentialsEmail
};