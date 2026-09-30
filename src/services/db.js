// ============================================================
// Sree Vasavi Temple – Cloud Database Service
// Backend (Render REST API) is the SINGLE SOURCE OF TRUTH.
// No localStorage used for data — all reads/writes go to the backend.
// ============================================================

const DEFAULT_BACKEND_URL = 'https://vasavi-temple-kadiyapulanka.onrender.com'
const BACKEND_URL = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL).trim()
const API_BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, '')}/api` : null

// Storage keys — used as property names in the backend data.json
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
  provider: API_BASE ? 'Render REST API' : 'Default Values (No backend)',
  status:   API_BASE ? 'Connected' : 'Not configured',
  endpointUrl: BACKEND_URL,
  apiKey:   '',
  autoSync: true
})

// No-op: cloud config is set via env / default constant
export const saveCloudConfig = (_config) => {}

// ── FETCH all data from backend ───────────────────────────────────────────────
/**
 * Fetches all temple data from the Render backend.
 * Called on app startup by AppContext.
 * Notifies all subscribers (AppContext) so React state is updated.
 * Also caches to localStorage for instant subsequent loads.
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

  // Cache to localStorage and push each key into AppContext via pub/sub
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

  console.log(`[API] ✓ Loaded ${keys.length} stores from backend:`, keys.join(', '))
  return payload
}

// ── SAVE a single key to backend & localStorage ─────────────────────────────
/**
 * Saves a key-value pair to localStorage (instant persistence) and the Render backend.
 * Also immediately notifies subscribers so React state updates without waiting.
 */
export const saveCloudData = async (key, data) => {
  // 1. Immediately cache in localStorage
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
    // PUT /api/data/:key — saves only this key on the backend
    const res = await apiFetch(`/data/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })

    if (res?.success) {
      console.log(`[API] ✓ "${key}" saved to backend`)
      return { success: true }
    } else {
      console.error(`[API] ✗ Backend rejected save for key: "${key}"`)
      return { success: false, error: 'Backend save failed' }
    }
  } catch (error) {
    console.error('[API] Save error:', error)
    return { success: false, error: error.message }
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
