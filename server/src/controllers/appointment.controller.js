const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Hospital = require("../models/hospital.model");
const AvailabilityService = require("../services/availability.service");
const { sendAppointmentConfirmationEmail, sendAppointmentCancellationEmail } = require("../services/email.service");

/**
 * Search doctors by hospital and specialty
 * GET /api/appointments/search-doctors
 * Query: ?hospitalId=HOSP_001&specialization=Cardiology
 */
async function searchDoctors(req, res) {
    try {
        const { hospitalId, specialization } = req.query;

        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }

        const query = {
            role: "doctor",
            hospitalId,
            status: "active"
        };

        if (specialization) {
            query["profile.specialization"] = specialization;
        }

        const doctors = await User.find(query)
            .select("profile doctorProfile email")
            .lean();

        const formattedDoctors = doctors.map(doc => ({
            _id: doc._id,
            name: `${doc.profile.firstName} ${doc.profile.lastName}`,
            specialization: doc.profile.specialization,
            department: doc.profile.department,
            yearsOfExperience: doc.doctorProfile?.yearsOfExperience,
            rating: doc.doctorProfile?.rating,
            consultationFee: doc.doctorProfile?.consultationFee,
            bio: doc.doctorProfile?.bio,
            email: doc.email
        }));

        return res.status(200).json({
            message: "Doctors found",
            count: formattedDoctors.length,
            doctors: formattedDoctors
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Get available slots for a doctor on specific dates
 * GET /api/appointments/available-slots
 * Query: ?doctorId=xxx&startDate=2026-05-15&daysAhead=7
 */
async function getAvailableSlots(req, res) {
    try {
        const { doctorId, startDate, daysAhead = 7 } = req.query;

        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }

        if (!startDate) {
            return res.status(400).json({ message: "Start date is required (YYYY-MM-DD)" });
        }

        // Validate doctor exists and is active
        const doctor = await User.findById(doctorId).lean();
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: "Doctor not found" });
        }

        if (doctor.status !== 'active') {
            return res.status(400).json({ message: "Doctor is not available" });
        }

        // Calculate slots for multiple days
        const startDateObj = new Date(startDate);
        const durationMinutes = doctor.doctorProfile?.consultationDuration || 30;

        const slotsData = {};
        for (let i = 0; i < parseInt(daysAhead); i++) {
            const date = new Date(startDateObj);
            date.setDate(date.getDate() + i);
            
            const dateString = date.toISOString().split('T')[0];
            try {
                const slots = await AvailabilityService.calculateAvailableSlots(
                    doctorId,
                    date,
                    durationMinutes
                );
                slotsData[dateString] = slots;
            } catch (error) {
                slotsData[dateString] = [];
            }
        }

        return res.status(200).json({
            message: "Available slots retrieved",
            doctorId,
            durationMinutes,
            slots: slotsData
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Book an appointment
 * POST /api/appointments/book
 * Body: { doctorId, hospitalId, appointmentDate, timeSlot, appointmentType, reason }
 */
async function bookAppointment(req, res) {
    try {
        // Patient must be logged in
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized - Patient must be logged in" });
        }

        const patientId = req.user._id;
        const { doctorId, hospitalId, appointmentDate, timeSlot, appointmentType = "consultation", reason } = req.body;

        // Validation
        if (!doctorId || !hospitalId || !appointmentDate || !timeSlot) {
            return res.status(400).json({ message: "Missing required fields: doctorId, hospitalId, appointmentDate, timeSlot" });
        }

        // Verify doctor exists and is active
        const doctor = await User.findById(doctorId).lean();
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: "Doctor not found" });
        }

        if (doctor.status !== 'active') {
            return res.status(400).json({ message: "Doctor is not available for booking" });
        }

        if (doctor.hospitalId !== hospitalId) {
            return res.status(400).json({ message: "Doctor does not work at this hospital" });
        }

        // Verify hospital exists
        const hospital = await Hospital.findOne({ hospitalId }).lean();
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        // Verify patient exists
        const patient = await User.findById(patientId).lean();
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Prevent booking in the past
        const appointmentDateTime = new Date(appointmentDate);
        const now = new Date();
        if (appointmentDateTime < now) {
            return res.status(400).json({ message: "Cannot book appointments in the past" });
        }

        // Critical: Lock and verify slot is available
        const durationMinutes = doctor.doctorProfile?.consultationDuration || 30;
        const isAvailable = await AvailabilityService.isSlotAvailable(
            doctorId,
            appointmentDateTime,
            timeSlot,
            durationMinutes
        );

        if (!isAvailable) {
            return res.status(409).json({ message: "This time slot is no longer available. Please select another slot." });
        }

        // Check if patient already has appointment at same time
        const existingAppointment = await Appointment.findOne({
            patientId,
            appointmentDate: appointmentDateTime,
            timeSlot,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            return res.status(409).json({ message: "You already have an appointment at this time" });
        }

        // Generate unique appointment ID
        const appointmentId = `APT_${hospitalId}_${appointmentDateTime.toISOString().split('T')[0].replace(/-/g, '')}_${timeSlot.replace(':', '')}`;

        // Create appointment
        const appointment = await Appointment.create({
            appointmentId,
            hospitalId,
            patientId,
            doctorId,
            appointmentDate: appointmentDateTime,
            timeSlot,
            duration: durationMinutes,
            appointmentType,
            reason,
            status: "scheduled",
            consultationFee: doctor.doctorProfile?.consultationFee || 0,
            patientSnapshot: {
                name: `${patient.profile.firstName} ${patient.profile.lastName}`,
                age: patient.profile.age,
                gender: patient.profile.gender,
                phone: patient.profile.phone,
                email: patient.email
            },
            doctorSnapshot: {
                name: `${doctor.profile.firstName} ${doctor.profile.lastName}`,
                specialization: doctor.profile.specialization,
                licenseNumber: doctor.profile.licenseNumber,
                email: doctor.email
            }
        });

        // Update doctor's appointment count
        await User.findByIdAndUpdate(doctorId, {
            $inc: { "doctorProfile.appointmentCount": 1 }
        });

        // Send confirmation emails
        try {
            await sendAppointmentConfirmationEmail({
                patientEmail: patient.email,
                patientName: patient.profile.firstName,
                doctorName: `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`,
                specialization: doctor.profile.specialization,
                appointmentDate,
                timeSlot,
                hospitalName: hospital.name,
                consultationFee: doctor.doctorProfile?.consultationFee || 0
            });

            await Appointment.findByIdAndUpdate(appointment._id, {
                bookingEmailSent: true
            });
        } catch (emailError) {
            console.error('Failed to send confirmation emails:', emailError.message);
        }

        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment: {
                appointmentId: appointment.appointmentId,
                date: appointment.appointmentDate,
                timeSlot: appointment.timeSlot,
                doctor: doctor.profile.firstName + ' ' + doctor.profile.lastName,
                hospital: hospital.name,
                status: appointment.status,
                fee: appointment.consultationFee
            }
        });
    } catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Cancel appointment
 * DELETE /api/appointments/:appointmentId
 * Patients and doctors can cancel
 */
async function cancelAppointment(req, res) {
    try {
        const { appointmentId } = req.params;
        const { reason } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Find appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Only patient or doctor can cancel
        const isPatient = appointment.patientId.toString() === userId.toString();
        const isDoctor = appointment.doctorId.toString() === userId.toString();

        if (!isPatient && !isDoctor) {
            return res.status(403).json({ message: "Not authorized to cancel this appointment" });
        }

        // Can't cancel already cancelled or completed appointments
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: "Appointment already cancelled" });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({ message: "Cannot cancel completed appointments" });
        }

        // Cancel appointment
        const cancelledBy = isPatient ? 'patient' : 'doctor';
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: 'cancelled',
                cancelledBy,
                cancellationReason: reason || 'No reason provided',
                cancelledAt: new Date()
            },
            { new: true }
        );

        // Decrease doctor's appointment count
        await User.findByIdAndUpdate(appointment.doctorId, {
            $inc: { "doctorProfile.appointmentCount": -1 }
        });

        // Send cancellation emails
        try {
            const patient = await User.findById(appointment.patientId);
            const doctor = await User.findById(appointment.doctorId);

            await sendAppointmentCancellationEmail({
                patientEmail: patient.email,
                patientName: patient.profile.firstName,
                doctorName: `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`,
                appointmentDate: appointment.appointmentDate,
                timeSlot: appointment.timeSlot,
                reason: cancelledBy === 'patient' ? 'Patient cancelled' : 'Doctor cancelled'
            });

            await Appointment.findByIdAndUpdate(appointmentId, {
                cancellationEmailSent: true
            });
        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError.message);
        }

        return res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment: updatedAppointment
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Get my appointments (patient or doctor)
 * GET /api/appointments/my-appointments
 */
async function getMyAppointments(req, res) {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId).lean();
        const query = user.role === 'doctor'
            ? { doctorId: userId }
            : { patientId: userId };

        const appointments = await Appointment.find(query)
            .populate('doctorId', 'profile email')
            .populate('patientId', 'profile email')
            .sort({ appointmentDate: -1 })
            .lean();

        return res.status(200).json({
            message: "Appointments retrieved",
            count: appointments.length,
            appointments
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Get doctor's schedule for a date
 * GET /api/doctors/:doctorId/schedule
 * Query: ?date=2026-05-15
 */
async function getDoctorSchedule(req, res) {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required (YYYY-MM-DD)" });
        }

        // Verify doctor exists
        const doctor = await User.findById(doctorId).lean();
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Get schedule
        const dateObj = new Date(date);
        const schedule = await AvailabilityService.getDoctorScheduleForDate(doctorId, dateObj);

        return res.status(200).json({
            message: "Doctor schedule retrieved",
            date,
            doctor: `${doctor.profile.firstName} ${doctor.profile.lastName}`,
            appointments: schedule
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    searchDoctors,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
    getMyAppointments,
    getDoctorSchedule
};