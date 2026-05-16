const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdmin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// All routes protected and only accessible by super_admin
router.use(protect, authorize('super_admin'));

router.get('/overview', superAdminController.overview);
router.get('/hospitals/pending', superAdminController.listPendingHospitals);
router.post('/hospitals/:hospitalId/approve', superAdminController.approveHospital);
router.post('/hospitals/:hospitalId/reject', superAdminController.rejectHospital);

module.exports = router;
