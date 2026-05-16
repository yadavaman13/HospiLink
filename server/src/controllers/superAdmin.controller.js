const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Hospital = require('../models/hospital.model');
const User = require('../models/user.model');
const ActivityLog = require('../models/activityLog.model');
const Bed = require('../models/bed.model');
const Appointment = require('../models/appointment.model');
const { sendHospitalAdminCredentialsEmail, sendEmail } = require('../services/email.service');

function buildHospitalId(sequence) {
    return `HOSP_${String(sequence).padStart(3, '0')}`;
}

async function overview(req, res) {
    try {
        const days = parseInt(req.query.days) || 7;
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));

        const hospitalsTotal = await Hospital.countDocuments();
        const patientsTotal = await User.countDocuments({ role: 'patient' });
        const doctorsTotal = await User.countDocuments({ role: 'doctor' });
        const appointmentsTotal = await Appointment.countDocuments();

        // Daily traffic from activity logs
        const trafficAgg = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: start } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Build last N days array
        const dailyTraffic = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const found = trafficAgg.find(t => t._id === key);
            dailyTraffic.push({ date: key, count: found ? found.count : 0 });
        }

        // Hospital-wise insights
        const hospitals = await Hospital.find().lean();
        const hospitalInsights = await Promise.all(hospitals.map(async (h) => {
            const patients = await User.countDocuments({ hospitalId: h.hospitalId, role: 'patient' });
            const doctors = await User.countDocuments({ hospitalId: h.hospitalId, role: 'doctor' });
            const beds = await Bed.countDocuments({ hospitalId: h.hospitalId });
            const occupiedBeds = await Bed.countDocuments({ hospitalId: h.hospitalId, status: 'occupied' });
            const appointments = await Appointment.countDocuments({ hospitalId: h.hospitalId });

            return {
                hospitalId: h.hospitalId,
                name: h.name,
                city: h.address?.city || null,
                status: h.status,
                reviewStatus: h.reviewStatus,
                patients,
                doctors,
                beds,
                occupiedBeds,
                appointments
            };
        }));

        return res.json({
            totals: { hospitals: hospitalsTotal, patients: patientsTotal, doctors: doctorsTotal, appointments: appointmentsTotal },
            dailyTraffic,
            hospitalInsights
        });
    } catch (err) {
        console.error('SuperAdmin overview error:', err);
        return res.status(500).json({ message: err.message });
    }
}

async function listPendingHospitals(req, res) {
    try {
        const hospitals = await Hospital.find({ reviewStatus: 'pending' }).populate('adminId', 'email profile status');
        return res.json({ hospitals });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function approveHospital(req, res) {
    try {
        const { hospitalId } = req.params;
        const { reviewNotes } = req.body;

        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

        const adminUser = await User.findById(hospital.adminId);
        if (!adminUser) return res.status(404).json({ message: 'Hospital admin not found' });

        // Ensure hospitalId exists (if somehow missing) - generate unique id
        if (!hospital.hospitalId) {
            const count = await Hospital.countDocuments();
            hospital.hospitalId = buildHospitalId(count + 1);
        }

        // Only generate and set a temporary password if admin has no password or is not active.
        let tempPassword = null;
        if (!adminUser.password || adminUser.status !== 'active') {
            tempPassword = `Hospi${crypto.randomBytes(4).toString('hex')}!`;
            const hashed = await bcrypt.hash(tempPassword, 10);

            adminUser.password = hashed;
            adminUser.status = 'active';
            await adminUser.save();
        } else {
            // Keep existing password; ensure admin is active without overriding credentials
            if (adminUser.status !== 'active') {
                adminUser.status = 'active';
                await adminUser.save();
            }
        }

        hospital.status = 'active';
        hospital.reviewStatus = 'approved';
        hospital.reviewedBy = req.user._id;
        hospital.reviewedAt = new Date();
        hospital.reviewNotes = reviewNotes || null;
        await hospital.save();

        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        try {
            if (tempPassword) {
                await sendHospitalAdminCredentialsEmail({
                    to: adminUser.email,
                    hospitalName: hospital.name,
                    hospitalId: hospital.hospitalId,
                    email: adminUser.email,
                    password: tempPassword,
                    loginUrl
                });
            } else {
                // Admin already has credentials; send approval notification without revealing a password
                const subject = `HospiLink: Hospital approved - ${hospital.name}`;
                const text = `Your hospital registration for ${hospital.name} has been approved. You can login at ${loginUrl} using your existing account.`;
                const html = `<div><p>Your hospital registration for <strong>${hospital.name}</strong> has been approved.</p><p>Please login at <a href=\"${loginUrl}\">${loginUrl}</a> using your existing credentials.</p></div>`;
                try {
                    await sendEmail(adminUser.email, subject, text, html);
                } catch (notifyErr) {
                    console.error('Error sending approval notification email:', notifyErr.message);
                }
            }
        } catch (emailErr) {
            console.error('Error sending admin credentials email:', emailErr.message);
        }

        return res.json({ message: 'Hospital approved', hospital });
    } catch (err) {
        console.error('Approve hospital error:', err);
        return res.status(500).json({ message: err.message });
    }
}

async function rejectHospital(req, res) {
    try {
        const { hospitalId } = req.params;
        const { reviewNotes } = req.body;

        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

        const adminUser = await User.findById(hospital.adminId);

        hospital.status = 'suspended';
        hospital.reviewStatus = 'rejected';
        hospital.reviewedBy = req.user._id;
        hospital.reviewedAt = new Date();
        hospital.reviewNotes = reviewNotes || 'Rejected by super admin';
        await hospital.save();

        // Notify admin by email with reason
        if (adminUser) {
            const subject = `HospiLink: Hospital registration rejected - ${hospital.name}`;
            const text = `Your hospital registration for ${hospital.name} has been rejected. Reason: ${hospital.reviewNotes}`;
            const html = `<div><p>Your hospital registration for <strong>${hospital.name}</strong> has been rejected.</p><p>Reason: ${hospital.reviewNotes}</p></div>`;
            try {
                await sendEmail(adminUser.email, subject, text, html);
            } catch (emailErr) {
                console.error('Error sending rejection email:', emailErr.message);
            }
        }

        return res.json({ message: 'Hospital rejected', hospital });
    } catch (err) {
        console.error('Reject hospital error:', err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { overview, listPendingHospitals, approveHospital, rejectHospital };
