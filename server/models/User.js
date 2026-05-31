const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'caretaker', 'elder'], default: 'patient' },
  age: { type: Number, default: 30, min: 1, max: 120 },
  phone: { type: String, default: '' },
  language: { type: String, default: 'en' },
  elderMode: { type: Boolean, default: false },
  linkedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  // Auto-set elderMode based on age or role
  if (this.age >= 55 || this.role === 'elder') {
    this.elderMode = true
  }
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
