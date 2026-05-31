const express = require('express');
const router = express.Router();
const { getPatients, getPatientStats } = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getPatients);
router.get('/stats', protect, getPatientStats);
module.exports = router;
