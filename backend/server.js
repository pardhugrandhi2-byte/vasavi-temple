// ============================================================
// Sree Vasavi Temple – REST API Backend (Supabase + Cloudinary)
// ============================================================
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const cloudinary = require('cloudinary').v2

const app = express()
const PORT = process.env.PORT || 4000
const DATA_FILE = path.join(__dirname, 'data.json')

// ── Supabase Setup ────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

let supabase = null
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  console.log('[DB] Supabase Cloud Client Initialized successfully.')
} else {
  console.warn('[DB] Warning: SUPABASE_URL or SUPABASE_SECRET_KEY missing. Falling back to local data.json.')
}

// ── Cloudinary Setup ──────────────────────────────────────────
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
  console.log('[Cloudinary] Image storage initialized successfully.')
}

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }))

// Allow requests from any origin (frontend on Netlify / Vercel / localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ── Local Fallback Helpers ─────────────────────────────────────
const readLocalData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('[DB] Error reading local data.json:', err.message)
  }
  return {}
}

const writeLocalData = (payload) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('[DB] Error writing local data.json:', err.message)
    return false
  }
}

// ── Data persistence helpers (Supabase primary, local fallback) ──
const readAllData = async () => {
  if (!supabase) {
    return readLocalData()
  }
  try {
    const { data, error } = await supabase.from('temple_config').select('key, value')
    if (error) {
      console.error('[DB] Supabase read error:', error.message)
      return readLocalData()
    }
    if (!data || data.length === 0) {
      console.info('[DB] Supabase table is empty. Seeding from local data.json...')
      const local = readLocalData()
      if (Object.keys(local).length > 0) {
        await writeAllData(local)
      }
      return local
    }
    const result = {}
    data.forEach(row => {
      result[row.key] = row.value
    })
    return result
  } catch (err) {
    console.error('[DB] Exception fetching from Supabase:', err.message)
    return readLocalData()
  }
}

const readSingleKey = async (key) => {
  if (!supabase) {
    const data = readLocalData()
    return data[key]
  }
  try {
    const { data, error } = await supabase.from('temple_config').select('value').eq('key', key).single()
    if (error) {
      if (error.code === 'PGRST116') return undefined // Row not found
      console.error(`[DB] Supabase key "${key}" read error:`, error.message)
      const local = readLocalData()
      return local[key]
    }
    return data?.value
  } catch (err) {
    console.error(`[DB] Exception reading key "${key}":`, err.message)
    const local = readLocalData()
    return local[key]
  }
}

const writeSingleKey = async (key, value) => {
  let supabaseSuccess = false
  if (supabase) {
    try {
      const { error } = await supabase
        .from('temple_config')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) {
        console.error(`[DB] Supabase upsert error for key "${key}":`, error.message)
      } else {
        supabaseSuccess = true
      }
    } catch (err) {
      console.error(`[DB] Exception writing key "${key}" to Supabase:`, err.message)
    }
  }

  // Also sync to local file as backup cache
  const localData = readLocalData()
  localData[key] = value
  writeLocalData(localData)

  return supabaseSuccess || !supabase
}

const writeAllData = async (payload) => {
  let supabaseSuccess = false
  if (supabase) {
    try {
      const rows = Object.keys(payload).map(key => ({
        key,
        value: payload[key],
        updated_at: new Date().toISOString()
      }))
      const { error } = await supabase
        .from('temple_config')
        .upsert(rows, { onConflict: 'key' })
      if (error) {
        console.error('[DB] Supabase batch upsert error:', error.message)
      } else {
        supabaseSuccess = true
      }
    } catch (err) {
      console.error('[DB] Exception writing batch data to Supabase:', err.message)
    }
  }

  const currentLocal = readLocalData()
  const merged = { ...currentLocal, ...payload }
  writeLocalData(merged)

  return supabaseSuccess || !supabase
}

// ── Routes ────────────────────────────────────────────────────

// Health check – Render pings this to confirm the service is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vasavi-temple-api',
    storageProvider: supabase ? 'Supabase Free Cloud' : 'Local File System (Fallback)',
    imageStorageProvider: (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) ? 'Cloudinary Cloud' : 'Direct Data URI / URL Fallback'
  })
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
app.get('/api/data', async (req, res) => {
  try {
    const data = await readAllData()
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/data/:key – Return a specific store by key
app.get('/api/data/:key', async (req, res) => {
  try {
    const { key } = req.params
    const val = await readSingleKey(key)
    if (val !== undefined) {
      res.json({ success: true, key, data: val })
    } else {
      res.status(404).json({ success: false, message: `Key "${key}" not found` })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/data – Replace / merge full temple state
app.put('/api/data', async (req, res) => {
  const incoming = req.body

  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' })
  }

  const ok = await writeAllData(incoming)

  if (ok) {
    console.log(`[DB] State updated in Supabase/Local – keys: ${Object.keys(incoming).join(', ')}`)
    res.json({ success: true, message: 'Data saved successfully' })
  } else {
    res.status(500).json({ success: false, message: 'Failed to write data to database' })
  }
})

// PUT /api/data/:key – Upsert a single key
app.put('/api/data/:key', async (req, res) => {
  const { key } = req.params
  const value = req.body

  const ok = await writeSingleKey(key, value)

  if (ok) {
    console.log(`[DB] Key "${key}" updated in persistent storage.`)
    res.json({ success: true, key })
  } else {
    res.status(500).json({ success: false, message: `Failed to write key "${key}" to database` })
  }
})

// POST /api/upload – Persistent image upload endpoint (Cloudinary)
app.post('/api/upload', async (req, res) => {
  const { image, folder = 'vasavi_temple' } = req.body

  if (!image) {
    return res.status(400).json({ success: false, message: 'Image data URI or URL is required' })
  }

  // Reject unnecessarily large files (>10MB in base64 size)
  if (typeof image === 'string' && image.length > 14 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'Image payload exceeds 10MB file limit' })
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder,
        resource_type: 'auto'
      })
      return res.json({
        success: true,
        secure_url: uploadRes.secure_url,
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id
      })
    } catch (err) {
      console.error('[Cloudinary] Upload error:', err.message)
      return res.status(500).json({ success: false, message: `Cloudinary upload failed: ${err.message}` })
    }
  } else {
    // Fallback if Cloudinary env vars aren't configured on the server
    return res.json({
      success: true,
      secure_url: image,
      url: image,
      message: 'Cloudinary not configured. Returning image URL / URI.'
    })
  }
})

// POST /api/reset – Clear all stored data (admin utility)
app.post('/api/reset', async (req, res) => {
  try {
    if (supabase) {
      await supabase.from('temple_config').delete().neq('key', '')
    }
    writeLocalData({})
    res.json({ success: true, message: 'All database records cleared' })
  } catch (err) {
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
