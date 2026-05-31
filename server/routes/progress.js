// routes/progress.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
router.get('/', protect, (req, res) => {
  res.json({ success: true, data: {
    weeklyData: [
      { day: 'Mon', score: 72, pain: 4 }, { day: 'Tue', score: 75, pain: 3 },
      { day: 'Wed', score: 0, pain: 0 }, { day: 'Thu', score: 78, pain: 3 },
      { day: 'Fri', score: 80, pain: 3 }, { day: 'Sat', score: 82, pain: 2 }, { day: 'Sun', score: 0, pain: 0 },
    ],
  }});
});
router.post('/', protect, (req, res) => {
  res.json({ success: true, message: 'Progress logged', data: { ...req.body, id: `prog-${Date.now()}` } });
});
module.exports = router;
