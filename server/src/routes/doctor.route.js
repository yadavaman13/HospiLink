const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
    addDoctorToHospital,
    getHospitalDoctors,
    updateDoctorAvailability,
    addDoctorLeave,
    startDoctorBreak,
    endDoctorBreak,
    getDoctorProfile
} = require('../controllers/doctor.controller');

// Hospital Admin adds doctor
router.post('/hospitals/:hospitalId/doctors/add', protect, authorize('hospital_admin'), addDoctorToHospital);

// Get doctors in hospital (public - for appointment booking)
router.get('/hospitals/:hospitalId/doctors', getHospitalDoctors);

// Doctor endpoints (protected)
router.get('/profile', protect, authorize('doctor'), getDoctorProfile);
router.put('/availability', protect, authorize('doctor'), updateDoctorAvailability);
router.post('/leave', protect, authorize('doctor'), addDoctorLeave);
router.post('/break/start', protect, authorize('doctor'), startDoctorBreak);
router.post('/break/end', protect, authorize('doctor'), endDoctorBreak);

module.exports = router;
