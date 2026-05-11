const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Hospital = require("../models/hospital.model");
const User = require("../models/user.model");
const { sendHospitalAdminCredentialsEmail } = require("../services/email.service");

function buildHospitalId(sequence) {
    return `HOSP_${String(sequence).padStart(3, '0')}`;
}

function buildTempPassword() {
    return `Hospi${crypto.randomBytes(4).toString('hex')}!`;
}

function normalizeRegistrationBody(body) {
    const admin = body.admin || {};

    return {
        name: body.name,
        address: body.address || {},
        contact: body.contact || {},
        logoUrl: body.logoUrl || null,
        adminFirstName: admin.firstName || body.adminFirstName,
        adminLastName: admin.lastName || body.adminLastName,
        adminEmail: admin.email || body.adminEmail,
        adminPhone: admin.phone || body.adminPhone,
        adminGender: admin.gender || body.adminGender,
        adminPassword: admin.password || body.adminPassword,
        departments: body.departments || []
    };
}

// Public hospital registration request
async function registerHospital(req, res){
    try {
        const payload = normalizeRegistrationBody(req.body);
        const {
            name,
            address,
            contact,
            logoUrl,
            adminFirstName,
            adminLastName,
            adminEmail,
            adminPhone,
            adminGender,
            adminPassword,
            departments
        } = payload;

        if (!name || !adminFirstName || !adminLastName || !adminEmail || !adminPhone || !adminGender) {
            return res.status(400).json({
                message: "Hospital name and admin details are required"
            });
        }

        const emailExists = await User.findOne({ email: adminEmail });
        if (emailExists) {
            return res.status(409).json({
                message: "Admin email already exists"
            });
        }

        const hospitalCount = await Hospital.countDocuments();
        let hospitalId = buildHospitalId(hospitalCount + 1);
        let existingHospital = await Hospital.findOne({ hospitalId });
        while (existingHospital) {
            hospitalId = buildHospitalId(hospitalCount + 1 + Math.floor(Math.random() * 900));
            existingHospital = await Hospital.findOne({ hospitalId });
        }

        const tempPassword = adminPassword || buildTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const adminUser = await User.create({
            hospitalId,
            role: "hospital_admin",
            email: adminEmail,
            password: hashedPassword,
            status: "inactive",
            profile: {
                firstName: adminFirstName,
                lastName: adminLastName,
                phone: adminPhone,
                gender: adminGender
            }
        });

        const hospital = await Hospital.create({
            hospitalId,
            name,
            address,
            contact,
            logoUrl,
            adminId: adminUser._id,
            status: "pending",
            reviewStatus: "pending",
            departments
        });

        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        let emailSent = false;
        try {
            await sendHospitalAdminCredentialsEmail({
                to: adminEmail,
                hospitalName: hospital.name,
                hospitalId: hospital.hospitalId,
                email: adminEmail,
                password: tempPassword,
                loginUrl
            });
            emailSent = true;
        } catch (emailError) {
            console.error('Failed to send hospital admin credentials email:', emailError.message);
        }

        return res.status(201).json({
            message: "Hospital registration submitted for approval",
            hospital: {
                id: hospital._id,
                hospitalId: hospital.hospitalId,
                name: hospital.name,
                status: hospital.status,
                reviewStatus: hospital.reviewStatus
            },
            admin: {
                id: adminUser._id,
                email: adminUser.email,
                role: adminUser.role,
                status: adminUser.status
            },
            emailSent
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getHospitals(req, res){
    try {
        const isSuperAdmin = req.user?.role === "super_admin";
        const query = isSuperAdmin ? {} : { status: "active" };
        const hospitals = await Hospital.find(query).populate("adminId", "email profile status");

        return res.status(200).json({ hospitals });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getHospitalById(req, res){
    try {
        const hospital = await Hospital.findOne({
            hospitalId: req.params.hospitalId,
            status: "active"
        }).populate("adminId", "email profile status");

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        return res.status(200).json({ hospital });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function approveHospital(req, res){
    try {
        const { hospitalId } = req.params;
        const { reviewNotes } = req.body;

        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        hospital.status = "active";
        hospital.reviewStatus = "approved";
        hospital.reviewedBy = req.user._id;
        hospital.reviewedAt = new Date();
        hospital.reviewNotes = reviewNotes || null;
        await hospital.save();

        await User.findByIdAndUpdate(hospital.adminId, { status: "active" });

        return res.status(200).json({
            message: "Hospital approved successfully",
            hospital
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function rejectHospital(req, res){
    try {
        const { hospitalId } = req.params;
        const { reviewNotes } = req.body;

        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        hospital.status = "suspended";
        hospital.reviewStatus = "rejected";
        hospital.reviewedBy = req.user._id;
        hospital.reviewedAt = new Date();
        hospital.reviewNotes = reviewNotes || "Rejected by super admin";
        await hospital.save();

        await User.findByIdAndUpdate(hospital.adminId, { status: "inactive" });

        return res.status(200).json({
            message: "Hospital rejected successfully",
            hospital
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function suspendHospital(req, res){
    try {
        const { hospitalId } = req.params;
        const { reviewNotes } = req.body;

        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        hospital.status = "suspended";
        hospital.reviewStatus = hospital.reviewStatus === "pending" ? "pending" : hospital.reviewStatus;
        hospital.reviewedBy = req.user._id;
        hospital.reviewedAt = new Date();
        hospital.reviewNotes = reviewNotes || "Suspended by super admin";
        await hospital.save();

        await User.findByIdAndUpdate(hospital.adminId, { status: "inactive" });

        return res.status(200).json({
            message: "Hospital suspended successfully",
            hospital
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function listPendingHospitals(req, res){
    try {
        const hospitals = await Hospital.find({ reviewStatus: "pending" }).populate("adminId", "email profile status");
        return res.status(200).json({ hospitals });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function updateHospitalAdminPassword(req, res){
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            message: 'Password updated successfully'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    registerHospital,
    getHospitals,
    getHospitalById,
    approveHospital,
    rejectHospital,
    suspendHospital,
    listPendingHospitals,
    updateHospitalAdminPassword
};

/**
 * List all approved hospitals (public endpoint for patient booking)
 * GET /api/hospitals/list
 */
async function listApprovedHospitals(req, res) {
    try {
        const hospitals = await Hospital.find({ status: 'approved' })
            .select('hospitalId name address contact departments beds')
            .lean();
        
        return res.status(200).json({ hospitals });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    registerHospital,
    getHospitals,
    getHospitalById,
    approveHospital,
    rejectHospital,
    suspendHospital,
    listPendingHospitals,
    updateHospitalAdminPassword,
    listApprovedHospitals
};