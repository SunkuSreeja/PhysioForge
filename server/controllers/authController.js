const jwt = require('jsonwebtoken')

let bcrypt = null
try { bcrypt = require('bcryptjs') } catch (e) {}

let User = null
try { User = require('../models/User') } catch (e) {}

const JWT_SECRET = process.env.JWT_SECRET || 'physioforge_super_secret_jwt_key_2025'

const signToken = (id, role, name, email, age) =>
  jwt.sign(
    { id, role, name, email, age: age || 30 },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )

// In-memory store for demo-mode registered users (survives only for the server session)
// When MongoDB is available, this is bypassed entirely
const demoUserStore = new Map()

// Seed demo accounts into in-memory store (always available for demo login)
const DEMO_ACCOUNTS = [
  { _id: 'mock-patient-1',   name: 'Priya Singh',      email: 'patient@demo.com',   role: 'patient',   age: 34, password: 'password123', passwordRaw: 'password123' },
  { _id: 'mock-doctor-1',    name: 'Dr. Arjun Sharma', email: 'doctor@demo.com',    role: 'doctor',    age: 41, password: 'password123', passwordRaw: 'password123' },
  { _id: 'mock-caretaker-1', name: 'Ramesh Patel',     email: 'caretaker@demo.com', role: 'caretaker', age: 58, password: 'password123', passwordRaw: 'password123' },
  { _id: 'mock-elder-1',     name: 'Rajesh Kumar',     email: 'elder@demo.com',     role: 'patient',   age: 62, password: 'password123', passwordRaw: 'password123' },
]
DEMO_ACCOUNTS.forEach(u => demoUserStore.set(u.email, u))

// ─── REGISTER ───────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, age } = req.body

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }
    const validRoles = ['patient', 'doctor', 'caretaker', 'elder']
    const userRole = validRoles.includes(role) ? role : 'patient'
    const userAge = Number(age) || 30

    // ── MongoDB path ──────────────────────────────────────────────────────────
    if (global.dbConnected && User) {
      try {
        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) {
          return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' })
        }
        const user = await User.create({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          role: userRole,
          age: userAge
        })
        // Do NOT return a token — force user to login separately
        return res.status(201).json({
          success: true,
          message: 'Account created successfully. Please login.'
        })
      } catch (dbErr) {
        console.warn('DB register failed, falling back to demo store:', dbErr.message)
      }
    }

    // ── Demo / offline path ──────────────────────────────────────────────────
    const emailLower = email.toLowerCase().trim()

    // Prevent duplicate registration in demo store
    if (demoUserStore.has(emailLower)) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' })
    }

    // Hash password for demo store too
    let hashedPw = password
    if (bcrypt) {
      hashedPw = await bcrypt.hash(password, 12)
    }

    const uid = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newUser = {
      _id: uid,
      name: name.trim(),
      email: emailLower,
      password: hashedPw,
      passwordRaw: password,  // keep for demo bcrypt-less fallback
      role: userRole,
      age: userAge,
      isDemo: true
    }
    demoUserStore.set(emailLower, newUser)

    console.log(`[Demo Store] Registered: ${emailLower} (role: ${userRole})`)

    // Do NOT return a token — force user to login separately
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please login.'
    })

  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ success: false, message: err.message || 'Registration failed' })
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' })
    }

    const emailLower = email.toLowerCase().trim()

    // ── MongoDB path ──────────────────────────────────────────────────────────
    if (global.dbConnected && User && bcrypt) {
      try {
        const user = await User.findOne({ email: emailLower }).select('+password')
        if (user) {
          const match = await user.matchPassword(password)
          if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' })
          }
          const token = signToken(user._id, user.role, user.name, user.email, user.age)
          return res.json({
            success: true, token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, age: user.age }
          })
        }
        // User not found in MongoDB — fall through to demo store check below
      } catch (dbErr) {
        console.warn('DB login failed, falling back to demo store:', dbErr.message)
      }
    }

    // ── Demo store path ───────────────────────────────────────────────────────
    const found = demoUserStore.get(emailLower)
    if (!found) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. If you registered, please ensure the server is running.'
      })
    }

    // Verify password — try bcrypt first, then plain comparison for demo accounts
    let match = false
    if (bcrypt && found.password) {
      // Check if stored password looks like a bcrypt hash (starts with $2a$ or $2b$)
      const isBcryptHash = found.password.startsWith("$2a$") || found.password.startsWith("$2b$")
      if (isBcryptHash) {
        try {
          match = await bcrypt.compare(password, found.password)
        } catch {
          match = password === found.passwordRaw
        }
      } else {
        // Plain-text stored password (pre-seeded demo accounts) — compare directly
        match = password === found.password || password === found.passwordRaw
      }
    } else {
      // No bcrypt — plain compare (only for pre-seeded demo accounts)
      match = password === found.password || password === found.passwordRaw
    }

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const token = signToken(found._id, found.role, found.name, found.email, found.age)
    return res.json({
      success: true, token,
      user: { id: found._id, name: found.name, email: found.email, role: found.role, age: found.age }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: err.message || 'Login failed' })
  }
}

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}

module.exports = { register, login, getMe }
