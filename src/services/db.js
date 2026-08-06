// ============================================================
// Sree Vasavi Temple – Cloud Database Service
// Backend (Render REST API) is the SINGLE SOURCE OF TRUTH.
// No localStorage used for data — all reads/writes go to the backend.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : null

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
  endpointUrl: API_BASE ? import.meta.env.VITE_API_URL : '',
  apiKey:   '',
  autoSync: true
})

// No-op: cloud config is set via .env.local, not runtime
export const saveCloudConfig = (_config) => {}

// ── FETCH all data from backend ───────────────────────────────────────────────
/**
 * Fetches all temple data from the Render backend.
 * Called on app startup by AppContext.
 * Notifies all subscribers (AppContext) so React state is updated.
 * Returns the full data payload or null if backend is unreachable.
 */
export const fetchRemoteCloudData = async () => {
  if (!API_BASE) {
    console.info('[API] No backend URL configured — using default values.')
    return null
  }

  const result = await apiFetch('/data')
  if (!result?.data) {
    console.warn('[API] Backend returned no data or is unreachable.')
    return null
  }

  const payload = result.data
  const keys = Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== null)

  // Push each key into AppContext via pub/sub
  keys.forEach(key => notifyListeners({ key, data: payload[key] }))

  console.log(`[API] ✓ Loaded ${keys.length} stores from backend:`, keys.join(', '))
  return payload
}

// ── SAVE a single key to backend ─────────────────────────────────────────────
/**
 * Saves a key-value pair to the Render backend.
 * Also immediately notifies subscribers so React state updates without waiting.
 * NO localStorage is used.
 */
export const saveCloudData = async (key, data) => {
  // Immediately update in-memory React state (instant UI update)
  notifyListeners({ key, data })

  if (!API_BASE) {
    console.warn('[API] No backend configured. Data only in React state (will reset on refresh).')
    return { success: false, error: 'No backend URL configured' }
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

// ── LOAD (no-op — kept for compatibility) ─────────────────────────────────────
/**
 * Returns the fallback directly — backend data is loaded asynchronously
 * via fetchRemoteCloudData() on app mount, not synchronously here.
 */
export const loadCloudData = (_key, fallback) => fallback
