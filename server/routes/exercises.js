// routes/exercises.js
const express = require('express');
const router = express.Router();
const { getExercises, getExerciseById, getTodayPlan } = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getExercises);
router.get('/today', protect, getTodayPlan);
router.get('/:id', protect, getExerciseById);
module.exports = router;
