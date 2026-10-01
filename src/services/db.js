// ============================================================
// Sree Vasavi Temple – Cloud Database Service
// Backend (Render REST API + Supabase) is the SINGLE SOURCE OF TRUTH.
// No localStorage used for data as primary source — all reads/writes go to backend.
// ============================================================

const DEFAULT_BACKEND_URL = 'https://vasavi-temple-kadiyapulanka.onrender.com'
const BACKEND_URL = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL).trim()
const API_BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, '')}/api` : null

// Storage keys — used as property names in Supabase & backend data store
export const STORAGE_KEYS = {
  GALLERY:   'vasavi_temple_gallery',
  CONTACT:   'vasavi_temple_contact',
  ABOUT:     'vasavi_temple_about',
  DONATION:  'vasavi_temple_donation',
  NOTICES:   'vasavi_temple_notices',
  FESTIVALS: 'vasavi_temple_festivals',
  SCHEDULE:  'vasavi_temple_schedule',
}

// ── In-memory pub/sub ─────────────────────────────────────────────────────────
// Used to push backend data into React state (AppContext) without prop drilling.
let cloudListeners = []

export const subscribeToCloud = (callback) => {
  cloudListeners.push(callback)
  return () => {
    cloudListeners = cloudListeners.filter(l => l !== callback)
  }
}

const notifyListeners = ({ key, data }) => {
  cloudListeners.forEach(l => l({ key, data }))
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
const apiFetch = async (path, options = {}) => {
  if (!API_BASE) return null
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    })
    if (!res.ok) {
      console.warn(`[API] ${options.method || 'GET'} ${path} → HTTP ${res.status}`)
      return null
    }
    return await res.json()
  } catch (err) {
    console.warn(`[API] Network error (${path}):`, err.message)
    return null
  }
}

// ── Cloud Config (for Admin panel display) ────────────────────────────────────
export const getCloudConfig = () => ({
  provider: API_BASE ? 'Supabase Free Cloud (via Render API)' : 'Default Values (No backend)',
  status:   API_BASE ? 'Connected' : 'Not configured',
  endpointUrl: BACKEND_URL,
  apiKey:   '',
  autoSync: true
})

// No-op: cloud config is set via env / default constant
export const saveCloudConfig = (_config) => {}

// ── FETCH all data from backend ───────────────────────────────────────────────
/**
 * Fetches all temple data from the Render backend (which queries Supabase).
 * Called on app startup by AppContext.
 * Notifies all subscribers (AppContext) so React state is updated.
 * Also caches to localStorage as temporary fallback.
 */
export const fetchRemoteCloudData = async () => {
  if (!API_BASE) {
    console.info('[API] No backend URL configured — using default / cached values.')
    return null
  }

  const result = await apiFetch('/data')
  if (!result?.data) {
    console.warn('[API] Backend returned no data or is unreachable.')
    return null
  }

  const payload = result.data
  const keys = Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== null)

  // Cache to localStorage as temporary cache and push each key into AppContext via pub/sub
  keys.forEach(key => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(payload[key]))
      }
    } catch (e) {
      // quota or private browsing issue
    }
    notifyListeners({ key, data: payload[key] })
  })

  console.log(`[API] ✓ Loaded ${keys.length} stores from Supabase cloud:`, keys.join(', '))
  return payload
}

// ── SAVE a single key to backend & localStorage ─────────────────────────────
/**
 * Saves a key-value pair to localStorage (temporary cache) and the Render backend (Supabase DB).
 * Returns { success: boolean, error?: string } to alert Admin on failure.
 */
export const saveCloudData = async (key, data) => {
  // 1. Immediately cache in localStorage as fallback
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (e) {
    console.warn(`[Storage] Failed to cache ${key} to localStorage:`, e)
  }

  // 2. Immediately update in-memory React state (instant UI update)
  notifyListeners({ key, data })

  if (!API_BASE) {
    console.warn('[API] No backend URL configured — saved to localStorage only.')
    return { success: true }
  }

  try {
    // PUT /api/data/:key — saves to Supabase via backend
    const res = await apiFetch(`/data/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })

    if (res?.success) {
      console.log(`[API] ✓ "${key}" persisted to Supabase`)
      return { success: true }
    } else {
      console.error(`[API] ✗ Backend rejected save for key: "${key}"`, res?.message)
      return { success: false, error: res?.message || 'Database write rejected' }
    }
  } catch (error) {
    console.error('[API] Save network error:', error)
    return { success: false, error: error.message || 'Network communication failure' }
  }
}

// ── Image Upload Helper (Cloudinary via Backend with 30s Timeout) ────────────
export const uploadImageToCloud = async (base64OrUrl, folder = 'vasavi_temple', timeoutMs = 30000) => {
  if (!API_BASE) return { success: false, error: 'No backend API configured' }

  console.log('[Cloudinary] Starting upload...')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: base64OrUrl, folder }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const uploadResult = { success: false, error: errData.message || `Upload failed with HTTP ${res.status}` }
      console.log('[Cloudinary] Upload result:', uploadResult)
      return uploadResult
    }

    const data = await res.json()
    // Only accept real Cloudinary HTTP/HTTPS URLs — never base64 data URIs
    if (data?.success && data?.url && /^https?:\/\//i.test(data.url)) {
      const uploadResult = { success: true, url: data.url, public_id: data.public_id }
      console.log('[Cloudinary] Upload result:', uploadResult)
      return uploadResult
    }
    const uploadResult = { success: false, error: data?.message || 'Upload did not return a valid Cloudinary URL' }
    console.log('[Cloudinary] Upload result:', uploadResult)
    return uploadResult
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      const uploadResult = { success: false, error: 'Upload timed out. Please try again.' }
      console.log('[Cloudinary] Upload result:', uploadResult)
      return uploadResult
    }
    const uploadResult = { success: false, error: err.message || 'Network error during upload' }
    console.log('[Cloudinary] Upload result:', uploadResult)
    return uploadResult
  }
}

// ── LOAD from localStorage with fallback ─────────────────────────────────────
/**
 * Returns locally cached data from localStorage if available, otherwise returns fallback.
 * Backend data is subsequently fetched asynchronously via fetchRemoteCloudData().
 */
export const loadCloudData = (key, fallback) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored)
      }
    }
  } catch (e) {
    console.warn(`[Storage] Failed to read ${key} from localStorage:`, e)
  }
  return fallback
}
