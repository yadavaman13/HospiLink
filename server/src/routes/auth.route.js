const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require("../middlewares/auth.middleware");


/**
 * POST /api/auth/register
 */
router.post('/register', authController.registerUser);

/**
 * GET /api/auth/me
 */
router.get('/me', protect, authController.getMe);

/**
 * POST /api/auth/login
 */
router.post('/login', authController.loginUser);

/**
 * POST /api/auth/logout
 */
router.post('/logout', protect, authController.logoutUser);

/**
 * PUT /api/auth/change-password
 */
router.put('/change-password', protect, authController.changePassword);



module.exports = router;