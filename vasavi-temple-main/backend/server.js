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

// GET /api/resolve-map?url=... – Resolves a Google Maps shortlink to embed URL
app.get('/api/resolve-map', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) {
    return res.status(400).json({ success: false, message: 'URL query parameter required' })
  }

  // Pre-configured known shortlink for Sree Vasavi Temple
  if (targetUrl.includes('Uh59h8TafZxFuwhn9')) {
    return res.json({
      success: true,
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3817.752005058017!2d81.8079729!3d16.888158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37bd006577cc1b%3A0x72511491942ab40!2z4LC24LGN4LCw4LGAIOCwteCwvuCwuOCwteCwvyDgsJXgsKjgsY3gsK_gsJXgsL4g4LCq4LCw4LCu4LGH4LC24LGN4LC14LCw4LC_IOCwhuCwsuCwr-Cwgg!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      shareUrl: 'https://maps.app.goo.gl/Uh59h8TafZxFuwhn9',
      coordinates: { lat: 16.888158, lng: 81.812479 }
    })
  }

  try {
    const response = await fetch(targetUrl, { redirect: 'follow' })
    const finalUrl = response.url || ''

    const atCoordsMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atCoordsMatch) {
      const lat = atCoordsMatch[1]
      const lng = atCoordsMatch[2]
      return res.json({
        success: true,
        embedUrl: `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=17&output=embed`,
        shareUrl: finalUrl
      })
    }

    res.json({
      success: true,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(finalUrl)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      shareUrl: finalUrl
    })
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(targetUrl)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    })
  }
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
