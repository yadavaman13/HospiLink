const express = require('express');
const router = express.Router();
const { setupDemoData } = require('../controllers/demo.controller');

/**
 * POST /api/demo/setup
 * Creates demo hospitals, doctors, and patient for testing
 */
router.post('/setup', setupDemoData);

module.exports = router;