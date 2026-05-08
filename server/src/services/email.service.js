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

module.exports = {
    sendEmail,
    sendHospitalAdminCredentialsEmail
};