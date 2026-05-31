// routes/doctors.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
router.get('/dashboard', protect, (req, res) => {
  res.json({ success: true, data: {
    totalPatients: 12,
    activeAlerts: 3,
    avgAdherence: 78,
    upcomingConsultations: 4,
    patients: [
      { id:'p1', name:'Priya Singh', diagnosis:'ACL Rehab', adherence:87, pain:3, postureScore:82, lastSession:'Today', status:'On Track' },
      { id:'p2', name:'Rajesh Kumar', diagnosis:'Lower Back', adherence:34, pain:7, postureScore:55, lastSession:'3d ago', status:'At Risk' },
      { id:'p3', name:'Sunita Devi', diagnosis:'Shoulder Surgery', adherence:72, pain:5, postureScore:68, lastSession:'Yesterday', status:'Monitor' },
      { id:'p4', name:'Amit Patel', diagnosis:'Hip Replacement', adherence:91, pain:2, postureScore:89, lastSession:'Today', status:'On Track' },
      { id:'p5', name:'Meera Nair', diagnosis:'Knee OA', adherence:65, pain:4, postureScore:74, lastSession:'2d ago', status:'Monitor' },
    ],
    alerts: [
      { patient:'Rajesh Kumar', type:'missed', message:'Missed 3 consecutive sessions', severity:'high' },
      { patient:'Sunita Devi', type:'pain', message:'Reported pain spike — 8/10', severity:'high' },
      { patient:'Meera Nair', type:'posture', message:'Posture accuracy dropped to 42%', severity:'medium' },
    ],
  }});
});
module.exports = router;
