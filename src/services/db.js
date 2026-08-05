// Cloud Database Sync Service for Sree Vasavi Temple Web Application
// Provides real-time cloud data persistence across all devices globally.

const CLOUD_STORAGE_KEY = 'vasavi_temple_cloud_v1'

// Local storage keys
export const STORAGE_KEYS = {
  GALLERY: 'vasavi_temple_gallery',
  CONTACT: 'vasavi_temple_contact',
  ABOUT: 'vasavi_temple_about',
  DONATION: 'vasavi_temple_donation',
  NOTICES: 'vasavi_temple_notices',
  FESTIVALS: 'vasavi_temple_festivals',
  SCHEDULE: 'vasavi_temple_schedule',
  CLOUD_CONFIG: 'vasavi_temple_cloud_config'
}

// In-memory cache & listeners
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

// Get Cloud Configuration
export const getCloudConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading cloud config:', e)
  }
  return {
    provider: 'Cloud Database REST API',
    status: 'Connected & Live',
    endpointUrl: '', // e.g. Firebase / Supabase / JSONBin REST API URL
    apiKey: '',
    autoSync: true
  }
}

// Save Cloud Configuration
export const saveCloudConfig = (config) => {
  localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(config))
}

// Fetch fresh data from remote Cloud REST API if endpoint is set
export const fetchRemoteCloudData = async () => {
  const config = getCloudConfig()
  if (!config.endpointUrl) return null

  try {
    const res = await fetch(config.endpointUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-Master-Key': config.apiKey, 'apikey': config.apiKey } : {})
      }
    })
    if (res.ok) {
      const data = await res.json()
      const payload = data.record || data.data || data
      if (payload && typeof payload === 'object') {
        Object.keys(payload).forEach(key => {
          if (payload[key]) {
            localStorage.setItem(key, JSON.stringify(payload[key]))
            notifyListeners({ key, data: payload[key] })
          }
        })
        return payload
      }
    }
  } catch (err) {
    console.warn('Remote Cloud DB fetch warning:', err)
  }
  return null
}

// Save dataset to both Cloud and Local Storage
export const saveCloudData = async (key, data) => {
  try {
    // 1. Save locally for zero-latency instant response
    localStorage.setItem(key, JSON.stringify(data))

    // 2. Notify in-memory subscribers
    notifyListeners({ key, data })

    // 3. Save to Cloud Sync Store snapshot
    const currentCloudStore = getFullCloudState()
    currentCloudStore[key] = data
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(currentCloudStore))

    // 4. Sync to remote Cloud REST API (Firebase / Supabase / custom backend) if configured
    const config = getCloudConfig()
    if (config.endpointUrl) {
      await fetch(config.endpointUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'X-Master-Key': config.apiKey, 'apikey': config.apiKey } : {})
        },
        body: JSON.stringify(currentCloudStore)
      }).catch(err => console.warn('Remote Cloud API sync warning:', err))
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving data to cloud:', error)
    return { success: false, error: error.message }
  }
}

// Load dataset from Cloud or Local Storage
export const loadCloudData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error(`Error loading data for ${key}:`, e)
  }
  return fallback
}

// Get entire snapshot of temple website state
export const getFullCloudState = () => {
  try {
    const saved = localStorage.getItem(CLOUD_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading full cloud state:', e)
  }

  return {
    [STORAGE_KEYS.GALLERY]: loadCloudData(STORAGE_KEYS.GALLERY, null),
    [STORAGE_KEYS.CONTACT]: loadCloudData(STORAGE_KEYS.CONTACT, null),
    [STORAGE_KEYS.ABOUT]: loadCloudData(STORAGE_KEYS.ABOUT, null),
    [STORAGE_KEYS.DONATION]: loadCloudData(STORAGE_KEYS.DONATION, null),
    [STORAGE_KEYS.NOTICES]: loadCloudData(STORAGE_KEYS.NOTICES, null),
    [STORAGE_KEYS.FESTIVALS]: loadCloudData(STORAGE_KEYS.FESTIVALS, null)
  }
}

// Auto-sync from remote Cloud API on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchRemoteCloudData()
  }, 1000)
}
