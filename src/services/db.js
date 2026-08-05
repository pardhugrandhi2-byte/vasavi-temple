// Cloud Database Sync Service for Sree Vasavi Temple Web Application
// Connects to a Node.js/Express REST API hosted on Render.
// Falls back gracefully to localStorage when the backend is unreachable.

// ─────────────────────────────────────────────────────────────────────────────
// Backend URL – set VITE_API_URL in .env.local to your Render service URL.
// Example: VITE_API_URL=https://vasavi-temple-api.onrender.com
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : null

// Local storage keys (unchanged — used as offline cache)
export const STORAGE_KEYS = {
  GALLERY:      'vasavi_temple_gallery',
  CONTACT:      'vasavi_temple_contact',
  ABOUT:        'vasavi_temple_about',
  DONATION:     'vasavi_temple_donation',
  NOTICES:      'vasavi_temple_notices',
  FESTIVALS:    'vasavi_temple_festivals',
  SCHEDULE:     'vasavi_temple_schedule',
  CLOUD_CONFIG: 'vasavi_temple_cloud_config'
}

// ── In-memory pub/sub (unchanged) ────────────────────────────────────────────
let cloudListeners = []

export const subscribeToCloud = (callback) => {
  cloudListeners.push(callback)
  return () => {
    cloudListeners = cloudListeners.filter(l => l !== callback)
  }
}

const notifyListeners = (data) => {
  cloudListeners.forEach(l => l(data))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generic fetch wrapper — returns null on any error */
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

// ── Cloud Config (legacy – kept for Admin panel compatibility) ────────────────
export const getCloudConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading cloud config:', e)
  }
  return {
    provider: API_BASE ? 'Render REST API' : 'Local Storage Only',
    status:   API_BASE ? 'Connected to Render' : 'No backend configured',
    endpointUrl: API_BASE || '',
    apiKey:   '',
    autoSync: true
  }
}

export const saveCloudConfig = (config) => {
  localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(config))
}

// ── Core API calls ────────────────────────────────────────────────────────────

/**
 * Fetch ALL temple data from Render backend.
 * On success, seeds every key into localStorage and notifies subscribers.
 */
export const fetchRemoteCloudData = async () => {
  if (!API_BASE) return null

  const result = await apiFetch('/data')
  if (!result?.data) return null

  const payload = result.data
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      localStorage.setItem(key, JSON.stringify(payload[key]))
      notifyListeners({ key, data: payload[key] })
    }
  })

  console.log('[API] Synced from Render backend ✓')
  return payload
}

/**
 * Save a single key-value pair.
 * 1. Saves to localStorage immediately (zero-latency UI update).
 * 2. PUTs the full snapshot to the Render backend.
 */
export const saveCloudData = async (key, data) => {
  try {
    // 1. Instant local save
    localStorage.setItem(key, JSON.stringify(data))
    notifyListeners({ key, data })

    // 2. Build full snapshot and push to Render
    const currentSnapshot = getFullCloudState()
    currentSnapshot[key] = data
    localStorage.setItem('vasavi_temple_cloud_v1', JSON.stringify(currentSnapshot))

    if (API_BASE) {
      const res = await apiFetch('/data', {
        method: 'PUT',
        body: JSON.stringify(currentSnapshot)
      })
      if (res?.success) {
        console.log(`[API] "${key}" persisted to Render ✓`)
      } else {
        console.warn(`[API] Render sync failed for key: "${key}" — localStorage retained`)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving data:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load a single key from localStorage (instant, offline-safe).
 * The Render backend is synced in bulk on app load via fetchRemoteCloudData().
 */
export const loadCloudData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error(`Error loading data for ${key}:`, e)
  }
  return fallback
}

/** Build a full snapshot of the current temple state from localStorage */
export const getFullCloudState = () => {
  try {
    const saved = localStorage.getItem('vasavi_temple_cloud_v1')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading full cloud state:', e)
  }
  return {
    [STORAGE_KEYS.GALLERY]:   loadCloudData(STORAGE_KEYS.GALLERY, null),
    [STORAGE_KEYS.CONTACT]:   loadCloudData(STORAGE_KEYS.CONTACT, null),
    [STORAGE_KEYS.ABOUT]:     loadCloudData(STORAGE_KEYS.ABOUT, null),
    [STORAGE_KEYS.DONATION]:  loadCloudData(STORAGE_KEYS.DONATION, null),
    [STORAGE_KEYS.NOTICES]:   loadCloudData(STORAGE_KEYS.NOTICES, null),
    [STORAGE_KEYS.FESTIVALS]: loadCloudData(STORAGE_KEYS.FESTIVALS, null)
  }
}

// ── Auto-sync on app load ─────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchRemoteCloudData()
  }, 800)
}
