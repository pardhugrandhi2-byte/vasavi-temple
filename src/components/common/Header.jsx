import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Info, 
  Clock, 
  Calendar, 
  Image as ImageIcon, 
  Heart, 
  Phone, 
  X, 
  Menu, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  MessageCircle,
  ExternalLink
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { VASAVI_DEVI_PHOTO } from '../../assets/vasavi_devi'

const menuItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'About', path: '/about', icon: Info },
  { label: 'Temple Timings', path: '/timings', icon: Clock },
  { label: 'Festivals', path: '/festivals', icon: Calendar },
  { label: 'Gallery', path: '/gallery', icon: ImageIcon },
  { label: 'Donations', path: '/donate', icon: Heart },
  { label: 'Contact', path: '/contact', icon: Phone }
]

const DEITY_PIC_URL = VASAVI_DEVI_PHOTO

const Header = () => {
  const { activeNotification, dismissNotification, scheduleJSON, contactStore } = useApp()
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

  // Prevent background scroll when mobile menu is open
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

  const templePhone = contactStore?.phone || '+91 88888 99999'
  const templeWhatsapp = contactStore?.whatsapp || '+91 99999 88888'

  return (
    <>
      {/* Top Banner Alert (Dynamic Info) */}
      <AnimatePresence>
        {activeNotification?.show && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-temple-maroon text-white text-xs md:text-sm font-medium relative z-30 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-grow justify-center text-center">
                <span className="inline-block w-2 h-2 rounded-full bg-temple-gold animate-ping shrink-0"></span>
                <span className="truncate">{activeNotification.message}</span>
              </div>
              <button 
                onClick={dismissNotification}
                className="text-white/80 hover:text-white transition-colors p-1 shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'py-2.5 sm:py-3 bg-temple-cream/95 shadow-md border-b border-temple-gold/15 backdrop-blur-md' 
            : 'py-3 sm:py-4 bg-temple-cream/90 backdrop-blur-sm border-b border-temple-gold/10'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2">
          {/* Logo & Temple Branding */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-temple-gold rounded-xl py-0.5 shrink-0 min-w-0"
          >
            {/* Sacred Deity DP Badge */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden shadow-md border-2 border-temple-gold/80 ring-2 ring-temple-gold/30 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0 bg-temple-maroon">
              <img 
                src={DEITY_PIC_URL} 
                alt="Sree Vasavi Kanyaka Parameswari Devi" 
                className="w-full h-full object-cover object-top scale-[1.12]"
              />
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="font-display font-extrabold text-sm sm:text-base lg:text-xl tracking-wider text-temple-maroon group-hover:text-temple-gold transition-colors duration-300 leading-tight truncate">
                SREE VASAVI
              </span>
              <span className="text-[9px] sm:text-[11px] lg:text-xs font-bold tracking-[0.14em] text-temple-gold uppercase font-sans truncate">
                Kanyaka Parameswari Temple
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 xl:px-4 py-2 text-xs xl:text-sm font-bold tracking-wide whitespace-nowrap transition-colors duration-300 hover:text-temple-gold focus:outline-none focus:text-temple-gold ${
                    isActive ? 'text-temple-maroon' : 'text-temple-charcoal-light'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute bottom-0 left-3 right-3 xl:left-4 xl:right-4 h-0.5 bg-gradient-to-r from-temple-gold to-temple-maroon rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-temple-gold/15 hover:bg-temple-gold/25 active:scale-95 text-temple-maroon border border-temple-gold/30 transition-all focus:outline-none focus:ring-2 focus:ring-temple-gold shrink-0"
            aria-expanded={isMobileOpen}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-temple-maroon" />
          </button>
        </div>
      </header>

      {/* Premium Full-Screen Mobile Navigation Drawer (z-[100] to sit cleanly on top of all page elements) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-[85vw] max-w-[340px] h-full bg-temple-cream text-temple-charcoal shadow-2xl flex flex-col z-[101] border-l border-temple-gold/30 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Header with Logo & Close Button */}
              <div className="p-4 bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white flex items-center justify-between border-b border-temple-gold/30 shrink-0 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-temple-gold shrink-0 bg-temple-cream shadow">
                    <img 
                      src={DEITY_PIC_URL} 
                      alt="Vasavi Devi" 
                      className="w-full h-full object-cover object-top scale-[1.15]"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-display font-bold text-sm tracking-wide text-white truncate">
                      Sree Vasavi Temple
                    </span>
                    <span className="text-[10px] text-temple-gold font-semibold uppercase tracking-wider truncate">
                      Penugonda Kshetram
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Darshan Status Pill in Drawer */}
              {scheduleJSON && (
                <div className="px-4 py-2.5 bg-temple-gold/15 border-b border-temple-gold/20 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${scheduleJSON.isOpen ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
                    <span className="font-bold text-temple-maroon">
                      {scheduleJSON.isOpen ? 'Sanctum Open' : 'Sanctum Closed'}
                    </span>
                  </div>
                  <span className="text-[11px] text-temple-charcoal-light font-medium">
                    {scheduleJSON.nextEventTime ? `Until ${scheduleJSON.nextEventTime}` : 'Daily Pujas'}
                  </span>
                </div>
              )}

              {/* Scrollable Navigation Links */}
              <div className="flex-grow overflow-y-auto px-4 py-4 flex flex-col gap-1">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white shadow-md' 
                            : 'text-temple-charcoal hover:bg-temple-gold/10 hover:text-temple-maroon active:bg-temple-gold/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-temple-gold' : 'text-temple-gold'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive ? (
                          <Sparkles className="w-3.5 h-3.5 text-temple-gold animate-pulse" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Admin Portal Quick Link */}
                <div className="pt-3 mt-2 border-t border-temple-gold/20">
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs font-bold text-temple-charcoal-light hover:text-temple-maroon hover:bg-temple-gold/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-temple-gold" />
                      <span>Admin Management Portal</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  </Link>
                </div>
              </div>

              {/* Drawer Footer with Quick Helplines */}
              <div className="p-4 bg-white/80 border-t border-temple-gold/20 flex flex-col gap-2.5 shrink-0 text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                  Devotee Helpline:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${templePhone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-temple-maroon text-white font-bold text-[11px] shadow-sm hover:opacity-90 active:scale-95 transition-all truncate"
                  >
                    <Phone className="w-3 h-3 text-temple-gold" />
                    <span>Call Office</span>
                  </a>
                  <a
                    href={`https://wa.me/${templeWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-green-600 text-white font-bold text-[11px] shadow-sm hover:opacity-90 active:scale-95 transition-all truncate"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="text-center text-[10px] text-gray-400 font-serif pt-1">
                  || Om Sri Vasavambayai Namaha ||
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
