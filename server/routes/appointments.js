const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const mockAppointments = [
  { id:'a1', patient:'Priya Singh', doctor:'Dr. Arjun Sharma', scheduledAt:'2025-05-14T14:00:00Z', type:'video', status:'confirmed', topic:'ACL Progress Review' },
  { id:'a2', patient:'Meera Nair', doctor:'Dr. Arjun Sharma', scheduledAt:'2025-05-14T16:30:00Z', type:'in-person', status:'confirmed', topic:'Knee Assessment' },
  { id:'a3', patient:'Amit Patel', doctor:'Dr. Arjun Sharma', scheduledAt:'2025-05-15T10:00:00Z', type:'video', status:'pending', topic:'Monthly Check-in' },
  { id:'a4', patient:'Sunita Devi', doctor:'Dr. Arjun Sharma', scheduledAt:'2025-05-16T11:00:00Z', type:'quick-checkin', status:'pending', topic:'Pain Follow-up' },
];
router.get('/', protect, (req, res) => res.json({ success: true, data: mockAppointments }));
router.post('/', protect, (req, res) => {
  const appt = { ...req.body, id: `a-${Date.now()}`, status: 'pending' };
  res.status(201).json({ success: true, data: appt });
});
module.exports = router;
