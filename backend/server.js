// ============================================================
// Sree Vasavi Temple – REST API Backend (Render Deployment)
// ============================================================
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4000
const DATA_FILE = path.join(__dirname, 'data.json')

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }))

// Allow requests from any origin (frontend on Netlify / Vercel / localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ── Data helpers ──────────────────────────────────────────────
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('[DB] Error reading data.json:', err.message)
  }
  return {}
}

const writeData = (payload) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('[DB] Error writing data.json:', err.message)
    return false
  }
}

// ── Routes ────────────────────────────────────────────────────

// Health check – Render pings this to confirm the service is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'vasavi-temple-api' })
})

// GET /api/data – Return full temple state
app.get('/api/data', (req, res) => {
  const data = readData()
  res.json({ success: true, data })
})

// GET /api/data/:key – Return a specific store by key
app.get('/api/data/:key', (req, res) => {
  const data = readData()
  const { key } = req.params
  if (data[key] !== undefined) {
    res.json({ success: true, key, data: data[key] })
  } else {
    res.status(404).json({ success: false, message: `Key "${key}" not found` })
  }
})

// PUT /api/data – Replace / merge full temple state
app.put('/api/data', (req, res) => {
  const current = readData()
  const incoming = req.body

  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' })
  }

  // Deep merge: new keys overwrite, existing keys not in payload are kept
  const merged = { ...current, ...incoming }
  const ok = writeData(merged)

  if (ok) {
    console.log(`[DB] State updated – keys: ${Object.keys(incoming).join(', ')}`)
    res.json({ success: true, message: 'Data saved successfully' })
  } else {
    res.status(500).json({ success: false, message: 'Failed to write data to disk' })
  }
})

// PUT /api/data/:key – Upsert a single key
app.put('/api/data/:key', (req, res) => {
  const data = readData()
  const { key } = req.params
  const value = req.body

  data[key] = value
  const ok = writeData(data)

  if (ok) {
    console.log(`[DB] Key "${key}" updated`)
    res.json({ success: true, key })
  } else {
    res.status(500).json({ success: false, message: 'Failed to write data to disk' })
  }
})

// POST /api/reset – Clear all stored data (admin utility)
app.post('/api/reset', (req, res) => {
  const ok = writeData({})
  if (ok) {
    res.json({ success: true, message: 'All data cleared' })
  } else {
    res.status(500).json({ success: false, message: 'Failed to reset data' })
  }
})

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' })
})

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛕  Sree Vasavi Temple API running on port ${PORT}`)
  console.log(`   Health : http://localhost:${PORT}/api/health`)
  console.log(`   Data   : http://localhost:${PORT}/api/data\n`)
})
