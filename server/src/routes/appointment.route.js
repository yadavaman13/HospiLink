const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
    searchDoctors,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
    getMyAppointments,
    getDoctorSchedule
} = require('../controllers/appointment.controller');

// Public endpoints
router.get('/search-doctors', searchDoctors);
router.get('/available-slots', getAvailableSlots);

// Protected endpoints
router.post('/book', protect, bookAppointment);
router.delete('/:appointmentId', protect, cancelAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/doctor/:doctorId/schedule', getDoctorSchedule);

module.exports = router;
