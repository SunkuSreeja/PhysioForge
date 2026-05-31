const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['mobility', 'strength', 'flexibility', 'balance', 'cardio'], default: 'mobility' },
  description: String,
  instructions: [String],
  duration: { type: Number, default: 300 }, // seconds
  reps: { type: Number, default: 10 },
  sets: { type: Number, default: 3 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  bodyPart: [String],
  videoUrl: String,
  thumbnailUrl: String,
  keyPoints: [String], // posture checkpoints
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
