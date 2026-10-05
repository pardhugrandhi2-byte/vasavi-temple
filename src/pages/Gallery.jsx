import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X, ChevronLeft, ChevronRight, Filter, Sparkles, Image as ImageIcon } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useApp } from '../context/AppContext'

// Categories list
const CATEGORIES = ['All', 'Temple', 'Festivals', 'Poojas', 'Construction']

const Gallery = () => {
  const { galleryStore } = useApp()
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [loadedImages, setLoadedImages] = useState({})

  const itemsToDisplay = galleryStore || []

  // Filter items based on active category
  const filteredItems = activeCategory === 'All' 
    ? itemsToDisplay 
    : itemsToDisplay.filter(item => item.category === activeCategory)

  // Track image load states for smooth blur-up rendering
  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }))
  }

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') handleNextLightbox()
      if (e.key === 'ArrowLeft') handlePrevLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, filteredItems])

  const handleNextLightbox = () => {
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredItems.length))
  }

  const handlePrevLightbox = () => {
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length))
  }

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null

  return (
    <PageTransition>
      <div className="py-12 md:py-20 px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-temple-gold font-semibold tracking-widest text-xs md:text-sm uppercase mb-2 block">
            Sacred Imagery
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-temple-charcoal mb-4">
            Temple Visual Gallery
          </h1>
          <p className="text-sm md:text-base text-temple-charcoal-light font-serif">
            Immerse in divine photography of Sree Vasavi Temple. Explore daily pujas, festive celebrations, architectural beauty, and new construction developments.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-none ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-temple-charcoal-light bg-white border border-temple-gold/20 hover:border-temple-gold hover:text-temple-maroon'
                }`}
              >
                <span className="relative z-10">{cat}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-temple-gold to-temple-maroon rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Responsive Masonry Grid Layout */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative bg-white rounded-2xl overflow-hidden border border-temple-gold/15 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                {/* Image Container with Hover Zoom & Blur-up optimization */}
                <div className={`w-full ${item.aspect} relative overflow-hidden bg-temple-cream-dark`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(item.id)}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
                      loadedImages[item.id] ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
                    } transition-all duration-500`}
                  />
                  
                  {/* Spiritual Golden Gradient Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                      <span className="bg-temple-gold text-white font-sans font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {item.category}
                      </span>
                      
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg font-bold font-display text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-white/80 font-serif line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Title Label (Mobile & Standard view) */}
                <div className="p-4 bg-white flex justify-between items-center border-t border-gray-100 group-hover:bg-temple-cream/30 transition-colors">
                  <span className="font-display font-bold text-sm text-temple-maroon">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-temple-gold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Lightbox Content Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full flex flex-col items-center justify-center max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Arrow Left */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 backdrop-blur-md transition-all z-20"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navigation Arrow Right */}
              <button
                onClick={handleNextLightbox}
                className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 backdrop-blur-md transition-all z-20"
                aria-label="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Lightbox Image Preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={currentLightboxItem.image}
                  alt={currentLightboxItem.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Lightbox Metadata Bar */}
              <div className="mt-4 w-full bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-4 md:p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-temple-gold text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                      {currentLightboxItem.category}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold font-display text-white">
                      {currentLightboxItem.title}
                    </h3>
                  </div>
                  <p className="text-xs text-white/80 font-serif">
                    {currentLightboxItem.description}
                  </p>
                </div>

                <div className="text-xs font-mono text-white/60 shrink-0">
                  Image {lightboxIndex + 1} of {filteredItems.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

export default Gallery
