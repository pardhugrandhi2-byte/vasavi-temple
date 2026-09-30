import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Only copy images if running locally (not during production build on hosting servers)
const isLocal = process.env.NODE_ENV !== 'production'

if (isLocal) {
  // Copy uploaded deity picture directly into public and src/assets on Vite dev start
  try {
    const srcPic = 'C:\\Users\\pc\\.gemini\\antigravity-ide\\brain\\5213f425-dd06-4142-b582-00425cca784a\\media__1785824007388.png'
    const publicDir = path.resolve(__dirname, './public')
    const assetsDir = path.resolve(__dirname, './src/assets')
    
    if (fs.existsSync(srcPic)) {
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })
      
      fs.copyFileSync(srcPic, path.join(publicDir, 'vasavi_devi.jpg'))
      fs.copyFileSync(srcPic, path.join(assetsDir, 'vasavi_devi.jpg'))
      
      const buf = fs.readFileSync(srcPic)
      const base64 = buf.toString('base64')
      const dataUriModule = `export const VASAVI_DEVI_PHOTO = "data:image/jpeg;base64,${base64}";\nexport default VASAVI_DEVI_PHOTO;\n`
      fs.writeFileSync(path.join(assetsDir, 'vasavi_devi.js'), dataUriModule, 'utf8')
      console.log('[Vite Config] Successfully synced Vasavi Devi deity image assets!')
    }
  } catch (e) {
    // Silently skip if local image files are not available
  }

  // Copy uploaded temple building hero image into public and src/assets on Vite dev start
  try {
    const templeHeroSrc = 'C:\\Users\\pc\\.gemini\\antigravity-ide\\brain\\5ca04919-cce1-4a8f-9c04-bdd4a2bb3a67\\media__1785909332751.jpg'
    const publicDir = path.resolve(__dirname, './public')
    const assetsDir = path.resolve(__dirname, './src/assets')

    if (fs.existsSync(templeHeroSrc)) {
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

      fs.copyFileSync(templeHeroSrc, path.join(publicDir, 'temple-hero.jpg'))
      fs.copyFileSync(templeHeroSrc, path.join(assetsDir, 'temple-hero.jpg'))
      console.log('[Vite Config] Successfully synced Temple Hero background image!')
    }
  } catch (e) {
    // Silently skip if local image files are not available
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

