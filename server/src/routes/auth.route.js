const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');

/**
 * POST /api/auth/register
 */
router.post('/register', authController.registerUser);

/**
 * GET /api/auth/getMe
 */
router.get('/getMe', authController.getMe);

/**
 * GET /api/auth/login
 */
router.get('/login', authController.loginUser);


module.exports = router;