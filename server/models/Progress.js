const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  painLevel: { type: Number, min: 0, max: 10, default: 5 },
  mood: { type: String, enum: ['comfortable', 'mild', 'moderate', 'severe'], default: 'comfortable' },
  sessionsCompleted: { type: Number, default: 0 },
  exercisesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
  postureAccuracy: { type: Number, min: 0, max: 100, default: 0 },
  durationMinutes: { type: Number, default: 0 },
  recoveryScore: { type: Number, min: 0, max: 100, default: 0 },
  notes: String,
  aiSummary: String,
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
