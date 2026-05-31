const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  type: { type: String, enum: ['video', 'in-person', 'quick-checkin'], default: 'video' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes: String,
  meetingLink: String,
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
