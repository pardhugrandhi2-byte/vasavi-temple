import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { VASAVI_DEVI_PHOTO } from '../../assets/vasavi_devi'

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Temple Timings', path: '/timings' },
  { label: 'Festivals', path: '/festivals' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Donations', path: '/donate' },
  { label: 'Contact', path: '/contact' }
]

const DEITY_PIC_URL = VASAVI_DEVI_PHOTO

const Header = () => {
  const { language, changeLanguage, activeNotification, dismissNotification } = useApp()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Track scroll position to update header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Top Banner Alert (Dynamic Info) */}
      <AnimatePresence>
        {activeNotification.show && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-temple-maroon text-white text-xs md:text-sm font-medium relative z-50 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-grow justify-center text-center">
                <span className="inline-block w-2 h-2 rounded-full bg-temple-gold animate-ping"></span>
                <span>{activeNotification.message}</span>
              </div>
              <button 
                onClick={dismissNotification}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Dismiss banner"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'py-3 bg-temple-cream/95 shadow-md border-b border-temple-gold/10 backdrop-blur-md' 
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo & Temple Name */}
          <Link to="/" className="flex items-center gap-2.5 lg:gap-3.5 xl:gap-4 group focus:outline-none focus:ring-2 focus:ring-temple-gold focus:ring-offset-2 rounded-xl py-1 shrink-0">
            {/* Sacred Deity DP Logo */}
            <div className="relative w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden shadow-lg border-2 border-temple-gold/60 ring-2 ring-temple-gold/30 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
              <img 
                src={DEITY_PIC_URL} 
                alt="Sree Vasavi Kanyaka Parameswari Devi" 
                className="w-full h-full object-cover object-top scale-[1.15]"
              />
            </div>
            
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base lg:text-xl xl:text-2xl tracking-wider text-temple-maroon group-hover:text-temple-gold transition-colors duration-300 leading-tight">
                SREE VASAVI
              </span>
              <span className="text-[10px] lg:text-xs xl:text-sm font-bold tracking-[0.16em] xl:tracking-[0.2em] text-temple-gold uppercase font-sans">
                Kanyaka Parameswari Temple
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-2.5 xl:px-4 py-2 text-xs xl:text-sm font-bold tracking-wide whitespace-nowrap transition-colors duration-300 hover:text-temple-gold focus:outline-none focus:text-temple-gold ${
                    isActive ? 'text-temple-maroon' : 'text-temple-charcoal-light'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute bottom-0 left-2.5 right-2.5 xl:left-4 xl:right-4 h-0.5 bg-gradient-to-r from-temple-gold to-temple-maroon rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </nav>



          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-temple-cream-dark/30 hover:bg-temple-cream-dark/60 text-temple-maroon transition-all duration-300 relative z-50 focus:outline-none focus:ring-2 focus:ring-temple-gold"
            aria-expanded={isMobileOpen}
            aria-label="Toggle Navigation Menu"
          >
            {/* Animated Hamburger Icon */}
            <div className="w-5 h-4 flex flex-col justify-between items-center relative overflow-hidden">
              <motion.span
                animate={isMobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-0.5 bg-current rounded-full origin-center"
              />
              <motion.span
                animate={isMobileOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={isMobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-0.5 bg-current rounded-full origin-center"
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-temple-charcoal/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-4/5 max-w-sm h-full bg-temple-cream shadow-2xl flex flex-col justify-between z-40"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Links */}
              <div className="flex-grow overflow-y-auto px-6 py-8 flex flex-col gap-1">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname === item.path
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center justify-between py-3.5 px-3 rounded-lg text-base font-medium tracking-wide transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-temple-maroon/10 to-transparent text-temple-maroon font-semibold border-l-4 border-temple-maroon' 
                            : 'text-temple-charcoal-light hover:bg-temple-cream-dark/30 hover:text-temple-gold'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && (
                          <svg className="w-4 h-4 text-temple-maroon animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
