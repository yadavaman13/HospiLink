const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require("../models/user.model");
const AvailabilityService = require("../services/availability.service");
const { sendDoctorCredentialsEmail } = require("../services/email.service");

/**
 * Hospital Admin adds a doctor to their hospital
 * POST /api/hospitals/:hospitalId/doctors/add
 * Body: { firstName, lastName, email, phone, specialization, department, licenseNumber, yearsOfExperience }
 */
async function addDoctorToHospital(req, res) {
    try {
        const { hospitalId } = req.params;
        const { firstName, lastName, email, phone, specialization, department, licenseNumber, yearsOfExperience, gender = 'other' } = req.body;

        // Only hospital admins can add doctors
        if (req.user.role !== 'hospital_admin' || req.user.hospitalId !== hospitalId) {
            return res.status(403).json({ message: "Only hospital admin can add doctors" });
        }

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !specialization || !licenseNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if email already exists
        const existingDoctor = await User.findOne({ email });
        if (existingDoctor) {
            return res.status(409).json({ message: "Doctor email already registered" });
        }

        // Check if license number already exists
        const existingLicense = await User.findOne({ 'profile.licenseNumber': licenseNumber });
        if (existingLicense) {
            return res.status(409).json({ message: "License number already registered" });
        }

        // Generate temporary password
        const tempPassword = `Doc${crypto.randomBytes(4).toString('hex')}!`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create doctor user
        const doctor = await User.create({
            hospitalId,
            role: 'doctor',
            email,
            password: hashedPassword,
            status: 'active', // Doctors are active immediately after hospital admin adds them
            profile: {
                firstName,
                lastName,
                phone,
                gender,
                specialization,
                department,
                licenseNumber
            },
            doctorProfile: {
                yearsOfExperience: yearsOfExperience || 0,
                consultationDuration: 30,
                consultationFee: 500,
                rating: 0,
                weeklySchedule: {
                    monday: { start: '09:00', end: '18:00', available: true },
                    tuesday: { start: '09:00', end: '18:00', available: true },
                    wednesday: { start: '09:00', end: '18:00', available: true },
                    thursday: { start: '09:00', end: '18:00', available: true },
                    friday: { start: '09:00', end: '18:00', available: true },
                    saturday: { start: null, end: null, available: false },
                    sunday: { start: null, end: null, available: false }
                },
                blockedDates: [],
                onBreak: {
                    isOnBreak: false,
                    reason: 'other'
                }
            }
        });

        // Send credentials email
        try {
            await sendDoctorCredentialsEmail({
                to: email,
                firstName,
                lastName,
                hospitalName: req.hospitalName || 'Your Hospital',
                email,
                password: tempPassword,
                hospitalId,
                loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
            });
        } catch (emailError) {
            console.error('Failed to send doctor credentials email:', emailError.message);
        }

        return res.status(201).json({
            message: "Doctor added successfully",
            doctor: {
                _id: doctor._id,
                name: `${doctor.profile.firstName} ${doctor.profile.lastName}`,
                email: doctor.email,
                specialization: doctor.profile.specialization,
                department: doctor.profile.department,
                licenseNumber: doctor.profile.licenseNumber,
                status: doctor.status
            }
        });
    } catch (error) {
        console.error('Error adding doctor:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Get all doctors in a hospital
 * GET /api/hospitals/:hospitalId/doctors
 */
async function getHospitalDoctors(req, res) {
    try {
        const { hospitalId } = req.params;

        const doctors = await User.find({
            hospitalId,
            role: 'doctor'
        })
            .select('profile doctorProfile email status')
            .lean();

        const formattedDoctors = doctors.map(doc => ({
            _id: doc._id,
            name: `${doc.profile.firstName} ${doc.profile.lastName}`,
            specialization: doc.profile.specialization,
            department: doc.profile.department,
            licenseNumber: doc.profile.licenseNumber,
            yearsOfExperience: doc.doctorProfile?.yearsOfExperience,
            email: doc.email,
            status: doc.status,
            rating: doc.doctorProfile?.rating,
            appointmentCount: doc.doctorProfile?.appointmentCount,
            consultationFee: doc.doctorProfile?.consultationFee,
            onBreak: doc.doctorProfile?.onBreak.isOnBreak
        }));

        return res.status(200).json({
            message: "Doctors retrieved",
            count: formattedDoctors.length,
            doctors: formattedDoctors
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Doctor updates their weekly schedule
 * PUT /api/doctors/availability
 * Body: { monday: {start, end, available}, ... }
 */
async function updateDoctorAvailability(req, res) {
    try {
        const doctorId = req.user?._id;
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify user is a doctor
        const doctor = await User.findById(doctorId);
        if (doctor.role !== 'doctor') {
            return res.status(403).json({ message: "Only doctors can update availability" });
        }

        const { weeklySchedule } = req.body;
        if (!weeklySchedule) {
            return res.status(400).json({ message: "Weekly schedule is required" });
        }

        // Validate schedule format
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of validDays) {
            if (weeklySchedule[day]) {
                const schedule = weeklySchedule[day];
                if (schedule.available && (!schedule.start || !schedule.end)) {
                    return res.status(400).json({ message: `${day} is marked available but missing start/end time` });
                }
            }
        }

        // Update availability
        const updatedDoctor = await User.findByIdAndUpdate(
            doctorId,
            {
                'doctorProfile.weeklySchedule': weeklySchedule
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Availability updated successfully",
            schedule: updatedDoctor.doctorProfile.weeklySchedule
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Doctor adds leave/blocked dates
 * POST /api/doctors/leave
 * Body: { startDate, endDate, reason }
 */
async function addDoctorLeave(req, res) {
    try {
        const doctorId = req.user?._id;
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doctor = await User.findById(doctorId);
        if (doctor.role !== 'doctor') {
            return res.status(403).json({ message: "Only doctors can add leave" });
        }

        const { startDate, endDate, reason = 'vacation' } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ message: "Start date must be before end date" });
        }

        // Add to blocked dates
        const blockedDateEntry = {
            startDate: start,
            endDate: end,
            reason,
            autoCancel: true
        };

        // Auto-cancel appointments in date range
        const cancelledCount = await AvailabilityService.autoCancelAppointmentsInDateRange(
            doctorId,
            start,
            end,
            reason
        );

        // Update doctor
        const updatedDoctor = await User.findByIdAndUpdate(
            doctorId,
            {
                $push: { 'doctorProfile.blockedDates': blockedDateEntry }
            },
            { new: true }
        );

        return res.status(200).json({
            message: `Leave added and ${cancelledCount} appointments auto-cancelled`,
            leave: blockedDateEntry,
            appointmentsCancelled: cancelledCount
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Doctor starts a break (emergency, lunch, etc.)
 * POST /api/doctors/break/start
 * Body: { reason, durationMinutes }
 */
async function startDoctorBreak(req, res) {
    try {
        const doctorId = req.user?._id;
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doctor = await User.findById(doctorId);
        if (doctor.role !== 'doctor') {
            return res.status(403).json({ message: "Only doctors can start break" });
        }

        const { reason = 'other', durationMinutes = 30 } = req.body;

        const breakStart = new Date();
        const breakEnd = new Date(breakStart.getTime() + durationMinutes * 60000);

        const updatedDoctor = await User.findByIdAndUpdate(
            doctorId,
            {
                'doctorProfile.onBreak': {
                    isOnBreak: true,
                    breakStart,
                    breakEnd,
                    reason
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: `Break started - ${reason}`,
            breakEnd: breakEnd.toISOString()
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Doctor ends their break
 * POST /api/doctors/break/end
 */
async function endDoctorBreak(req, res) {
    try {
        const doctorId = req.user?._id;
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doctor = await User.findById(doctorId);
        if (doctor.role !== 'doctor') {
            return res.status(403).json({ message: "Only doctors can end break" });
        }

        const updatedDoctor = await User.findByIdAndUpdate(
            doctorId,
            {
                'doctorProfile.onBreak': {
                    isOnBreak: false,
                    reason: 'other'
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Break ended - you are back online"
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Get doctor profile (current doctor)
 * GET /api/doctors/profile
 */
async function getDoctorProfile(req, res) {
    try {
        const doctorId = req.user?._id;
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doctor = await User.findById(doctorId)
            .select('-password')
            .lean();

        if (doctor.role !== 'doctor') {
            return res.status(403).json({ message: "Only doctors can access this" });
        }

        return res.status(200).json({
            message: "Doctor profile retrieved",
            doctor
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    addDoctorToHospital,
    getHospitalDoctors,
    updateDoctorAvailability,
    addDoctorLeave,
    startDoctorBreak,
    endDoctorBreak,
    getDoctorProfile
};
