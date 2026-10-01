// ============================================================
// Sree Vasavi Temple – Frontend Supabase Client
// Used ONLY for direct browser → Supabase Storage uploads.
// NEVER uses SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.
// Temple config data still goes via Render API → Supabase DB.
// ============================================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Image uploads will not work until these are configured in your .env file.'
  )
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || ''
)

// ── Supabase Storage Bucket ────────────────────────────────────────────────────
const BUCKET = 'temple-images'

/**
 * Resizes and compresses an image File/Blob to a Blob (never base64).
 * @param {File} file - Original file from <input type="file">
 * @param {number} maxDim - Maximum width or height in pixels
 * @param {number} quality - JPEG quality 0–1
 * @returns {Promise<Blob>}
 */
const resizeToBlob = (file, maxDim = 1200, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for resizing'))
    }
    img.src = objectUrl
  })

/**
 * Upload an image File directly to Supabase Storage (no base64, no Render).
 * Returns { success, url, path } on success or { success: false, error } on failure.
 *
 * @param {File} file       - Original File object from the browser file picker
 * @param {string} folder   - Folder inside the bucket: 'gallery' | 'qr' | 'about'
 * @param {object} opts     - Optional: { maxDim, quality }
 */
export const uploadImageToStorage = async (file, folder = 'gallery', opts = {}) => {
  const { maxDim = 1200, quality = 0.85 } = opts

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      success: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    }
  }

  if (!file || !(file instanceof File)) {
    return { success: false, error: 'No valid File object provided for upload.' }
  }

  console.log('[Supabase Storage] Starting upload to folder:', folder)

  try {
    // Resize & compress to Blob — no base64 string involved
    const blob = await resizeToBlob(file, maxDim, quality)

    // Unique path so we never overwrite existing files
    const randomId = Math.random().toString(36).slice(2, 9)
    const filePath = `${folder}/${Date.now()}-${randomId}.jpg`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false // never overwrite
      })

    if (uploadError) {
      console.error('[Supabase Storage] Upload error:', uploadError.message)
      return {
        success: false,
        error: `Supabase image upload failed: ${uploadError.message}`
      }
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    const publicUrl = data?.publicUrl

    if (!publicUrl || !/^https?:\/\//i.test(publicUrl)) {
      return {
        success: false,
        error: 'Supabase did not return a valid public URL after upload.'
      }
    }

    console.log('[Supabase Storage] Upload successful:', publicUrl)
    return { success: true, url: publicUrl, path: filePath }
  } catch (err) {
    console.error('[Supabase Storage] Exception during upload:', err.message)
    return {
      success: false,
      error: `Supabase image upload failed: ${err.message || 'Unknown error'}`
    }
  }
}
