import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Phone, Calendar, ArrowRight, Heart } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import UpiDonationSection from '../components/common/UpiDonationSection'
import { useApp } from '../context/AppContext'
import { loadCloudData, subscribeToCloud, STORAGE_KEYS } from '../services/db'

// Temple building hero image served from /public/temple-hero.jpg (copied by vite.config.js at startup)
const HERO_BG_FALLBACK = '/temple-hero.jpg'

// Custom float particles for the spiritual light effects
const floatingLights = Array.from({ length: 15 }).map((_, i) => {
  const x = Math.random() * 100
  const xOffset1 = (Math.random() * 10 - 5)
  const xOffset2 = (Math.random() * 20 - 10)
  return {
    id: i,
    size: Math.random() * 8 + 4,
    x,
    xKeyframes: [`${x}vw`, `${x + xOffset1}vw`, `${x + xOffset2}vw`],
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
  }
})

const INITIAL_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Sravana Shukravaram Special Abhishekam',
    category: 'Poojas',
    date: '2026-08-07',
    description: 'Special Kumkumarchana and Laksha Bilwarchana will be performed on Friday from 6:00 AM onwards.',
    isUnread: true
  },
  {
    id: '2',
    title: 'Extended Darshan Hours during Sri Krishna Janmashtami',
    category: 'Timings',
    date: '2026-08-15',
    description: 'Temple sanctum will remain open continuously until midnight for special Utsavam.',
    isUnread: true
  },
  {
    id: '3',
    title: 'Annadanam Hall Expansion Construction Progress',
    category: 'Facilities',
    date: '2026-08-01',
    description: 'The new multi-purpose dining hall expansion is progressing well to serve 5,000 pilgrims daily.',
    isUnread: false
  },
  {
    id: '4',
    title: 'Online Slot Booking Advisory',
    category: 'Alert',
    date: '2026-07-28',
    description: 'Please carry e-ticket barcode printout or mobile copy along with government ID proof for fast-track entry.',
    isUnread: false
  }
]

const Home = () => {
  const { scheduleJSON } = useApp()
  const heroImageSrc = HERO_BG_FALLBACK

  const [timeStatus, setTimeStatus] = useState({
    isOpen: false,
    label: 'Checking status...',
    hoursLabel: '',
    countdown: ''
  })

  const [announcements, setAnnouncements] = useState(() => {
    return loadCloudData(STORAGE_KEYS.NOTICES, INITIAL_ANNOUNCEMENTS)
  })
  const [activeNoticeCategory, setActiveNoticeCategory] = useState('All')

  useEffect(() => {
    const unsubscribe = subscribeToCloud(({ key, data }) => {
      if (key === STORAGE_KEYS.NOTICES) setAnnouncements(data)
    })
    return () => unsubscribe()
  }, [])

  const toggleReadStatus = (id) => {
    setAnnouncements(prev => prev.map(notice => 
      notice.id === id ? { ...notice, isUnread: !notice.isUnread } : notice
    ))
  }

  const filteredAnnouncements = announcements.filter(item => {
    if (activeNoticeCategory === 'All') return true
    return item.category === activeNoticeCategory
  })

  // Synchronize Home timeStatus from live scheduleJSON
  useEffect(() => {
    if (!scheduleJSON) return
    setTimeStatus({
      isOpen: scheduleJSON.isOpen,
      label: scheduleJSON.todaysTimings?.isClosedAllDay 
        ? 'Closed All Day' 
        : (scheduleJSON.isOpen ? 'Open Now' : 'Closed Now'),
      hoursLabel: scheduleJSON.todaysTimings?.title || 'Standard Darshan Hours',
      countdown: scheduleJSON.countdown?.text || (scheduleJSON.isOpen ? 'Open for Darshan' : 'Opens Soon')
    })
  }, [scheduleJSON])

  return (
    <PageTransition>
      {/* Hero Section Container */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-temple-charcoal py-20 px-6">
        
        {/* Background Image with Mobile-Optimized Temple Framing */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={heroImageSrc} 
            alt="Sree Vasavi Kanyaka Parameswari Temple Building" 
            className="w-full h-full object-cover object-[50%_25%] sm:object-center scale-100 sm:scale-105 filter brightness-100 contrast-105 saturate-110 transition-all duration-300"
          />
          {/* Subtle gradient overlay for clear text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-temple-charcoal-dark via-temple-charcoal-dark/55 to-black/35 sm:via-temple-charcoal-dark/45 sm:to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-temple-charcoal-dark/60 via-transparent to-temple-charcoal-dark/60 sm:from-temple-charcoal-dark/40 sm:to-temple-charcoal-dark/40"></div>
        </div>

        {/* Floating Temple Light Effects (Floating Diyas / Sparks) */}
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
          {floatingLights.map((light) => (
            <motion.div
              key={light.id}
              initial={{ 
                x: `${light.x}vw`, 
                y: `${light.y}vh`, 
                opacity: 0.1,
                scale: 0.8
              }}
              animate={{
                y: ['100vh', '-10vh'],
                x: light.xKeyframes,
                opacity: [0, 0.6, 0.8, 0.4, 0],
                scale: [0.8, 1.2, 1, 1.4, 0.6]
              }}
              transition={{
                duration: light.duration,
                repeat: Infinity,
                delay: light.delay,
                ease: "easeInOut"
              }}
              style={{
                width: light.size,
                height: light.size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #F5A623 0%, rgba(198,124,0,0.4) 60%, rgba(168,50,50,0) 100%)',
                boxShadow: '0 0 12px 4px rgba(245,166,35,0.4)',
                position: 'absolute'
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl w-full mx-auto text-center flex flex-col items-center px-4">
          {/* Subheading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2 mb-3 sm:mb-4 bg-temple-gold/15 border border-temple-gold/40 rounded-full px-3.5 sm:px-4 py-1 sm:py-1.5 backdrop-blur-md shadow-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-temple-gold animate-ping"></span>
            <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.18em] text-temple-gold uppercase font-sans">
              Sacred Gateway of Blessings
            </span>
          </motion.div>

          {/* Temple Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-2xl sm:text-5xl md:text-7xl font-bold tracking-tight sm:tracking-wide text-white leading-snug sm:leading-tight font-display drop-shadow-xl"
          >
            Sree Vasavi Kanyaka <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-temple-gold via-yellow-200 to-temple-gold-light">
              Parameswari Temple
            </span>
          </motion.h1>

          {/* Welcome Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-3 sm:mt-6 text-xs sm:text-lg md:text-xl text-white/90 max-w-2xl font-serif leading-relaxed drop-shadow"
          >
            Step into the divine realms of spiritual tranquility and ancient wisdom. May Goddess Vasavi Devi guide your path with grace, peace, and prosperity.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0"
          >
            <Link 
              to="/timings" 
              className="btn-gold !py-3 sm:!py-3.5 !px-6 sm:!px-8 text-xs sm:text-sm uppercase tracking-wider font-bold hover:-translate-y-0.5 transition-transform"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>View Timings</span>
            </Link>
            
            <Link 
              to="/contact" 
              className="px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-white/80 text-white hover:bg-white hover:text-temple-charcoal-dark font-bold rounded text-xs sm:text-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-0.5 bg-black/20 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Contact Temple</span>
            </Link>
          </motion.div>

          {/* Live Status Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 w-full max-w-md border border-temple-gold/30 backdrop-blur-md bg-black/30 rounded-xl p-5 md:p-6 text-left relative overflow-hidden"
          >
            {/* Ambient gold glow in widget */}
            <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-temple-gold/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest font-sans">
                  Today's Darshan
                </span>
                <span className="text-sm md:text-base font-semibold text-white/90 mt-0.5">
                  Temple Status
                </span>
              </div>
              
              {/* Dynamic Status Pill */}
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${timeStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${timeStatus.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                  {timeStatus.label}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-white/95 text-xs md:text-sm">
              <div className="flex justify-between items-center text-white/80">
                <span>Opening Hours:</span>
                <span className="font-semibold text-white">{timeStatus.hoursLabel}</span>
              </div>
              
              <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded border border-white/5 mt-1">
                <span className="text-white/60">Live Countdown:</span>
                <span className="font-mono text-temple-gold font-bold tracking-wider text-sm md:text-base">
                  {timeStatus.countdown}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] text-white uppercase tracking-widest font-bold font-sans">Explore Sevas</span>
          <svg className="w-5 h-5 text-temple-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Sacred UPI QR Scanner & PhonePe Donation Section */}
      <UpiDonationSection />

      {/* Announcements & Latest Notices Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-temple-gold/15">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <span className="text-temple-gold font-semibold tracking-widest text-xs md:text-sm uppercase mb-1 block">
              Official Bulletin
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-temple-charcoal font-display">
              Latest Announcements & Notices
            </h2>
          </div>

          {/* Action & Filter Buttons */}
          {/* Category Filter Pills */}
          <div className="flex bg-white border border-temple-gold/20 rounded-full p-1 text-xs shadow-sm">
            {['All', 'Timings', 'Poojas', 'Facilities', 'Alert'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveNoticeCategory(cat)}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  activeNoticeCategory === cat
                    ? 'bg-temple-gold text-white shadow-sm font-semibold'
                    : 'text-temple-charcoal-light hover:text-temple-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnnouncements.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`bg-white rounded-2xl p-6 border-2 flex flex-col justify-between gap-4 transition-all duration-300 relative shadow-sm hover:shadow-md ${
                item.isUnread ? 'border-temple-gold ring-1 ring-temple-gold/20' : 'border-temple-gold/10'
              }`}
            >
              {/* Card Header: Category badge, Unread badge, Date */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans ${
                    item.category === 'Alert' 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : item.category === 'Timings' 
                        ? 'bg-temple-gold/15 text-temple-gold border border-temple-gold/30' 
                        : item.category === 'Poojas' 
                          ? 'bg-temple-maroon/10 text-temple-maroon border border-temple-maroon/20' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {item.category}
                  </span>

                  {item.isUnread && (
                    <span className="bg-red-500 text-white font-sans font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      NEW
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-temple-charcoal-light flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-temple-gold" />
                  {item.date}
                </span>
              </div>

              {/* Notice Title & Body */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold font-display text-temple-charcoal">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-temple-charcoal-light leading-relaxed font-serif">
                  {item.description}
                </p>
              </div>

              {/* Card Footer controls */}
              <div className="pt-3 border-t border-dotted border-gray-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleReadStatus(item.id)}
                  className="text-xs text-temple-gold hover:text-temple-maroon font-semibold transition-colors flex items-center gap-1"
                >
                  {item.isUnread ? '✓ Mark as Read' : '↺ Mark as Unread'}
                </button>

                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">Official Temple Bulletin</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

export default Home


