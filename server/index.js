const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

// CORS — allow Vite dev server on multiple ports
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PhysioForge API running',
    timestamp: new Date().toISOString(),
    dbMode: global.dbConnected ? 'mongodb' : 'demo',
  })
})

// Routes
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/patients',     require('./routes/patients'))
app.use('/api/doctors',      require('./routes/doctors'))
app.use('/api/exercises',    require('./routes/exercises'))
app.use('/api/progress',     require('./routes/progress'))
app.use('/api/appointments', require('./routes/appointments'))

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000

async function start() {
  // Try MongoDB — non-blocking, falls back to demo mode gracefully
  try {
    const mongoose = require('mongoose')
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/physioforge',
      { serverSelectionTimeoutMS: 3000 }
    )
    global.dbConnected = true
    console.log('✅ MongoDB connected')
  } catch (err) {
    global.dbConnected = false
    console.warn('⚠️  MongoDB unavailable — running in DEMO MODE (no data persistence)')
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 PhysioForge API on http://localhost:${PORT}`)
    console.log(`📊 Mode: ${global.dbConnected ? 'MongoDB' : 'Demo (mock data)'}`)
    console.log(`\nDemo accounts (password: password123):`)
    console.log('  patient@demo.com')
    console.log('  doctor@demo.com')
    console.log('  caretaker@demo.com')
    console.log('  elder@demo.com  (age 62 → Elder Mode)\n')
  })
}

start()
