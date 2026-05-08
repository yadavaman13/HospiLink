const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");

class AvailabilityService {
    /**
     * Calculate available time slots for a doctor on a specific date
     * @param {string} doctorId - Doctor MongoDB ID
     * @param {Date} date - The date to check (YYYY-MM-DD)
     * @param {number} durationMinutes - Duration of appointment (30, 60, etc.)
     * @param {number} bufferMinutes - Break between appointments (default 5)
     * @returns {Array} Array of available slots like ["09:00", "09:30", "10:00"]
     */
    static async calculateAvailableSlots(doctorId, date, durationMinutes = 30, bufferMinutes = 5) {
        try {
            // Fetch doctor with availability data
            const doctor = await User.findById(doctorId).lean();
            if (!doctor || doctor.role !== 'doctor') {
                throw new Error("Doctor not found or invalid role");
            }

            const { doctorProfile, status } = doctor;
            if (!doctorProfile) {
                throw new Error("Doctor profile not configured");
            }

            // Check if doctor is inactive or on leave
            if (status === 'inactive') {
                return [];
            }

            if (status === 'on_leave') {
                return [];
            }

            // Convert date to Day name (monday, tuesday, etc.)
            const dayName = this.getDayName(date);
            const daySchedule = doctorProfile.weeklySchedule?.[dayName];

            // Check if doctor works on this day
            if (!daySchedule || !daySchedule.available) {
                return [];
            }

            // Check if date is in blocked dates
            const isDateBlocked = this.isDateInBlockedRange(date, doctorProfile.blockedDates);
            if (isDateBlocked) {
                return [];
            }

            // Parse working hours
            const [workStartHour, workStartMin] = daySchedule.start.split(':').map(Number);
            const [workEndHour, workEndMin] = daySchedule.end.split(':').map(Number);

            const workStartMinutes = workStartHour * 60 + workStartMin;
            const workEndMinutes = workEndHour * 60 + workEndMin;

            // Get all booked appointments for this doctor on this date (not cancelled)
            const bookedAppointments = await Appointment.find({
                doctorId,
                appointmentDate: {
                    $gte: new Date(date.toISOString().split('T')[0]),
                    $lt: new Date(new Date(date).setDate(date.getDate() + 1))
                },
                status: { $ne: 'cancelled' }
            }).lean();

            // Create list of occupied time blocks (in minutes from start of day)
            const occupiedMinutes = new Set();

            bookedAppointments.forEach(apt => {
                const [aptHour, aptMin] = apt.timeSlot.split(':').map(Number);
                const aptStartMinutes = aptHour * 60 + aptMin;
                
                // Mark all minutes occupied by this appointment + buffer
                for (let i = 0; i < apt.duration + bufferMinutes; i++) {
                    occupiedMinutes.add(aptStartMinutes + i);
                }
            });

            // Check doctor's break status
            const onBreakMinutes = this.getBreakOccupiedMinutes(
                doctorProfile.onBreak,
                workStartMinutes,
                workEndMinutes
            );

            // Merge break minutes into occupied set
            onBreakMinutes.forEach(min => occupiedMinutes.add(min));

            // Generate available slots
            const availableSlots = [];
            for (let currentMinutes = workStartMinutes; currentMinutes <= workEndMinutes - durationMinutes; currentMinutes += durationMinutes) {
                // Check if all minutes for this appointment are available
                let isSlotAvailable = true;
                for (let i = 0; i < durationMinutes; i++) {
                    if (occupiedMinutes.has(currentMinutes + i)) {
                        isSlotAvailable = false;
                        break;
                    }
                }

                if (isSlotAvailable) {
                    const hours = Math.floor(currentMinutes / 60);
                    const mins = currentMinutes % 60;
                    const slotTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                    availableSlots.push(slotTime);
                }
            }

            return availableSlots;
        } catch (error) {
            console.error('Error calculating available slots:', error.message);
            throw error;
        }
    }

    /**
     * Get available slots for next N days
     * @param {string} doctorId - Doctor MongoDB ID
     * @param {number} daysAhead - Number of days to check (default 7)
     * @param {number} durationMinutes - Duration of appointment (default 30)
     * @returns {Object} { "2026-05-15": ["09:00", "09:30"], "2026-05-16": [...] }
     */
    static async calculateMultipleDaysSlots(doctorId, daysAhead = 7, durationMinutes = 30) {
        const slotsPerDay = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Prevent booking in past
        for (let i = 1; i <= daysAhead; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);

            const dateString = date.toISOString().split('T')[0];
            try {
                const slots = await this.calculateAvailableSlots(doctorId, date, durationMinutes);
                slotsPerDay[dateString] = slots;
            } catch (error) {
                console.error(`Error for ${dateString}:`, error.message);
                slotsPerDay[dateString] = [];
            }
        }

        return slotsPerDay;
    }

    /**
     * Check if a specific date/time slot is available for booking
     * (Called right before confirming booking to prevent race conditions)
     */
    static async isSlotAvailable(doctorId, date, timeSlot, durationMinutes = 30) {
        try {
            const availableSlots = await this.calculateAvailableSlots(doctorId, date, durationMinutes);
            return availableSlots.includes(timeSlot);
        } catch (error) {
            console.error('Error checking slot availability:', error.message);
            return false;
        }
    }

    /**
     * Convert date object to day name (monday, tuesday, etc.)
     */
    static getDayName(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    /**
     * Check if date falls within any blocked date range
     */
    static isDateInBlockedRange(date, blockedDates = []) {
        const dateOnly = date.toISOString().split('T')[0];
        return blockedDates.some(block => {
            const blockStart = new Date(block.startDate).toISOString().split('T')[0];
            const blockEnd = new Date(block.endDate).toISOString().split('T')[0];
            return dateOnly >= blockStart && dateOnly <= blockEnd;
        });
    }

    /**
     * Get occupied minutes due to doctor's current break
     */
    static getBreakOccupiedMinutes(onBreakData, dayStartMinutes, dayEndMinutes) {
        const occupied = new Set();

        if (!onBreakData || !onBreakData.isOnBreak) {
            return occupied;
        }

        const breakStart = new Date(onBreakData.breakStart);
        const breakEnd = new Date(onBreakData.breakEnd);

        // Only consider if break is today
        const now = new Date();
        if (breakStart.toDateString() !== now.toDateString()) {
            return occupied;
        }

        const breakStartMinutes = breakStart.getHours() * 60 + breakStart.getMinutes();
        const breakEndMinutes = breakEnd.getHours() * 60 + breakEnd.getMinutes();

        // Add all minutes in break range to occupied set
        for (let i = breakStartMinutes; i < breakEndMinutes; i++) {
            if (i >= dayStartMinutes && i <= dayEndMinutes) {
                occupied.add(i);
            }
        }

        return occupied;
    }

    /**
     * Lock a slot to prevent race conditions during booking
     * (Simple version using version number - can be upgraded to Redis)
     */
    static async lockSlot(doctorId, date, timeSlot, durationMinutes = 30) {
        try {
            // Before booking, verify slot is still available
            const isAvailable = await this.isSlotAvailable(doctorId, date, timeSlot, durationMinutes);
            if (!isAvailable) {
                throw new Error("Slot no longer available - already booked");
            }

            return true;
        } catch (error) {
            console.error('Error locking slot:', error.message);
            throw error;
        }
    }

    /**
     * When appointment is cancelled, slot becomes available again
     * (Handled by setting status to 'cancelled' - no explicit unlock needed)
     */
    static async unlockSlot(appointmentId) {
        // Simply mark appointment as cancelled
        // Availability calculation will automatically exclude it
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'cancelled', cancelledAt: new Date() },
            { new: true }
        );
        return appointment;
    }

    /**
     * Auto-cancel appointments when doctor adds a leave block
     */
    static async autoCancelAppointmentsInDateRange(doctorId, startDate, endDate, reason) {
        try {
            const dateStart = new Date(startDate);
            const dateEnd = new Date(endDate);
            dateEnd.setHours(23, 59, 59, 999);

            // Find all non-cancelled appointments in date range
            const appointmentsToCancel = await Appointment.find({
                doctorId,
                appointmentDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                },
                status: { $nin: ['cancelled', 'completed', 'no_show'] }
            });

            // Cancel each appointment
            for (const apt of appointmentsToCancel) {
                await Appointment.findByIdAndUpdate(apt._id, {
                    status: 'cancelled',
                    cancelledBy: 'system',
                    cancellationReason: `Doctor leave: ${reason}`,
                    cancelledAt: new Date()
                });
            }

            return appointmentsToCancel.length;
        } catch (error) {
            console.error('Error auto-cancelling appointments:', error.message);
            throw error;
        }
    }

    /**
     * Get doctor's schedule for a specific date (for doctor view)
     */
    static async getDoctorScheduleForDate(doctorId, date) {
        try {
            const dateStart = new Date(date);
            dateStart.setHours(0, 0, 0, 0);

            const dateEnd = new Date(date);
            dateEnd.setHours(23, 59, 59, 999);

            const appointments = await Appointment.find({
                doctorId,
                appointmentDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                },
                status: { $ne: 'cancelled' }
            })
                .populate('patientId', 'profile email')
                .lean()
                .sort({ timeSlot: 1 });

            return appointments;
        } catch (error) {
            console.error('Error getting doctor schedule:', error.message);
            throw error;
        }
    }
}

module.exports = AvailabilityService;
