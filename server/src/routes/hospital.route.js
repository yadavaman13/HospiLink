const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/register', hospitalController.registerHospital);
router.get('/', protect, authorize('super_admin'), hospitalController.getHospitals);
router.get('/pending', protect, authorize('super_admin'), hospitalController.listPendingHospitals);
router.get('/:hospitalId', hospitalController.getHospitalById);
router.put('/:hospitalId/approve', protect, authorize('super_admin'), hospitalController.approveHospital);
router.put('/:hospitalId/reject', protect, authorize('super_admin'), hospitalController.rejectHospital);
router.put('/:hospitalId/suspend', protect, authorize('super_admin'), hospitalController.suspendHospital);

module.exports = router;