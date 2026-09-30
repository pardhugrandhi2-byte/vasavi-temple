import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Sparkles, X, Check, Search, AlertCircle } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useApp, INITIAL_FESTIVALS } from '../context/AppContext'

const Festivals = () => {
  const { festivalsStore } = useApp()
  const festivals = festivalsStore && festivalsStore.length > 0 ? festivalsStore : INITIAL_FESTIVALS
  const [searchQuery, setSearchQuery] = useState('')
  const [countdowns, setCountdowns] = useState({})
  const [toastMessage, setToastMessage] = useState(null)

  // Real-time Countdown Engine
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime()
      const newCountdowns = {}

      festivals.forEach(fest => {
        // Parse festival target date (defaults to 00:00:00 on the date)
        const targetDate = new Date(`${fest.date}T00:00:00`).getTime()
        const diffMs = targetDate - now

        if (diffMs <= 0) {
          // If the date is today or past
          const endOfDay = new Date(`${fest.date}T23:59:59`).getTime()
          if (now <= endOfDay) {
            newCountdowns[fest.id] = { isToday: true, label: 'Celebrating Today!' }
          } else {
            newCountdowns[fest.id] = { isPast: true, label: 'Event Completed' }
          }
        } else {
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

          newCountdowns[fest.id] = {
            days,
            hours,
            minutes,
            seconds,
            label: `${days}d ${hours}h ${minutes}m ${seconds}s`
          }
        }
      })

      setCountdowns(newCountdowns)
    }

    updateCountdowns()
    const timer = setInterval(updateCountdowns, 1000)
    return () => clearInterval(timer)
  }, [festivals])

  // Sort festivals by nearest date chronologically
  const sortedFestivals = [...festivals].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Filter festivals based on search
  const filteredFestivals = sortedFestivals.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Identify the single next upcoming festival (first festival on or after today)
  const todayStr = new Date().toISOString().split('T')[0]
  const nextUpcoming = sortedFestivals.find(f => f.date >= todayStr) || sortedFestivals[0]

  return (
    <PageTransition>
      <div className="py-12 md:py-20 px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-6 z-50 bg-temple-gold text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold"
            >
              <Check className="w-5 h-5 bg-white text-temple-gold rounded-full p-0.5" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-temple-gold/15 pb-8">
          <div className="text-center md:text-left">
            <span className="text-temple-gold font-semibold tracking-widest text-xs md:text-sm uppercase mb-2 block">
              Sacred Calendar
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-temple-charcoal mb-3">
              Festival & Utsavam Calendar
            </h1>
            <p className="text-sm md:text-base text-temple-charcoal-light font-serif max-w-2xl">
              Discover auspicious festival dates, special puja timings, and live countdowns. Celebrate sacred days with Sree Vasavi Kanyaka Parameswari Devi.
            </p>
          </div>
        </div>

        {/* Featured Upcoming Festival Hero Card */}
        {nextUpcoming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 bg-gradient-to-br from-temple-maroon to-temple-maroon-dark text-white rounded-3xl overflow-hidden shadow-xl border-2 border-temple-gold relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Column: Festival Image */}
              <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[300px]">
                <img
                  src={nextUpcoming.image}
                  alt={nextUpcoming.name}
                  className="w-full h-full object-cover filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-temple-maroon via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-temple-maroon"></div>
                <div className="absolute top-4 left-4 bg-temple-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Major Festival</span>
                </div>
              </div>

              {/* Right Column: Festival Details & Big Countdown */}
              <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-temple-gold font-sans font-bold text-xs uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded">
                      {nextUpcoming.category}
                    </span>
                    <span className="text-white/80 font-mono text-xs flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-temple-gold" />
                      {new Date(nextUpcoming.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-4xl font-bold font-display text-white mb-3">
                    {nextUpcoming.name}
                  </h2>
                  <p className="text-xs md:text-sm text-white/85 leading-relaxed font-serif">
                    {nextUpcoming.description}
                  </p>
                </div>

                {/* Special Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/25 p-4 rounded-2xl border border-white/10 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-temple-gold font-sans uppercase font-bold text-[10px] tracking-wider">Morning Special Hours</span>
                    <span className="font-mono text-white text-sm">{nextUpcoming.morningTiming}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-temple-gold font-sans uppercase font-bold text-[10px] tracking-wider">Evening Special Hours</span>
                    <span className="font-mono text-white text-sm">{nextUpcoming.eveningTiming}</span>
                  </div>
                </div>

                {/* Big Animated Countdown Boxes */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-white/70 font-sans uppercase tracking-widest font-semibold">
                    Countdown Until Festival Start:
                  </span>
                  
                  {countdowns[nextUpcoming.id]?.isToday ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl font-bold text-base text-center animate-pulse">
                      🎉 Festival Celebrations are Live Today!
                    </div>
                  ) : countdowns[nextUpcoming.id]?.isPast ? (
                    <div className="bg-white/10 text-white/70 px-4 py-2 rounded-xl text-xs text-center font-mono">
                      Event Concluded
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-black/30 border border-temple-gold/30 p-2.5 rounded-xl">
                        <span className="text-lg md:text-2xl font-bold font-mono text-temple-gold block">
                          {countdowns[nextUpcoming.id]?.days ?? 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Days</span>
                      </div>
                      <div className="bg-black/30 border border-temple-gold/30 p-2.5 rounded-xl">
                        <span className="text-lg md:text-2xl font-bold font-mono text-temple-gold block">
                          {countdowns[nextUpcoming.id]?.hours ?? 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Hours</span>
                      </div>
                      <div className="bg-black/30 border border-temple-gold/30 p-2.5 rounded-xl">
                        <span className="text-lg md:text-2xl font-bold font-mono text-temple-gold block">
                          {countdowns[nextUpcoming.id]?.minutes ?? 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Mins</span>
                      </div>
                      <div className="bg-black/30 border border-temple-gold/30 p-2.5 rounded-xl">
                        <span className="text-lg md:text-2xl font-bold font-mono text-temple-gold block">
                          {countdowns[nextUpcoming.id]?.seconds ?? 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Secs</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h3 className="font-display font-bold text-xl text-temple-charcoal">
            All Upcoming Festivals ({filteredFestivals.length})
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-temple-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search festival name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-temple-gold/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold"
            />
          </div>
        </div>

        {/* Responsive Festival Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFestivals.map((fest, idx) => {
            const isHighlighted = fest.id === nextUpcoming?.id
            const countdownData = countdowns[fest.id]

            return (
              <motion.div
                key={fest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className={`bg-white rounded-2xl overflow-hidden border-2 flex flex-col justify-between h-full transition-all duration-300 relative shadow-sm hover:shadow-xl ${
                  isHighlighted 
                    ? 'border-temple-gold ring-2 ring-temple-gold/20' 
                    : 'border-temple-gold/15'
                }`}
              >
                {/* Highlight Badge */}
                {isHighlighted && (
                  <div className="absolute top-3 left-3 bg-temple-gold text-white font-sans font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md z-20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Next Up</span>
                  </div>
                )}

                {/* Card Image Header */}
                <div className="h-48 w-full overflow-hidden relative bg-temple-charcoal-dark">
                  <img
                    src={fest.image}
                    alt={fest.name}
                    className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Category Pill */}
                  <span className="absolute bottom-3 left-4 text-[10px] font-bold text-temple-gold tracking-widest uppercase font-sans bg-black/40 px-2 py-0.5 rounded border border-temple-gold/30">
                    {fest.category}
                  </span>

                  {/* Date Badge */}
                  <span className="absolute bottom-3 right-4 text-xs font-mono font-bold text-white bg-temple-maroon/80 px-2.5 py-1 rounded shadow">
                    {new Date(fest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex flex-col flex-grow justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-temple-maroon font-display">
                      {fest.name}
                    </h3>
                    <p className="text-xs text-temple-charcoal-light leading-relaxed font-serif line-clamp-3">
                      {fest.description}
                    </p>
                  </div>

                  {/* Special Timings Box */}
                  <div className="bg-temple-cream/60 p-3 rounded-xl border border-temple-gold/15 flex flex-col gap-1.5 text-xs font-mono text-temple-charcoal">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-temple-maroon font-sans font-bold uppercase">Morning Hours:</span>
                      <span className="font-bold">{fest.morningTiming}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-temple-gold/10 pt-1">
                      <span className="text-[10px] text-temple-maroon font-sans font-bold uppercase">Evening Hours:</span>
                      <span className="font-bold">{fest.eveningTiming}</span>
                    </div>
                  </div>

                  {/* Live Countdown Badge Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-temple-charcoal/50 uppercase tracking-wider font-sans flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-temple-gold" />
                      Status:
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      countdownData?.isToday 
                        ? 'bg-green-100 text-green-700 animate-pulse' 
                        : countdownData?.isPast 
                          ? 'bg-gray-100 text-gray-500' 
                          : 'bg-temple-gold/10 text-temple-maroon'
                    }`}>
                      {countdownData?.label ?? 'Calculating...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Developer Integration Note */}
        <div className="mt-12 p-5 bg-white border border-dashed border-temple-gold/30 rounded-2xl text-xs text-temple-charcoal-light flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-temple-gold shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-temple-charcoal uppercase tracking-wider block mb-1">
              API Connection Architecture:
            </span>
            <span>
              The festival calendar sorts dates dynamically and updates countdown timers in real time. To connect with a backend administrative database, bind `setFestivals` to a fetch call (e.g., `GET /api/v1/festivals`). When an admin submits the modal form, trigger a `POST /api/v1/festivals` request.
            </span>
          </div>
        </div>
      </div>

    </PageTransition>
  )
}

export default Festivals
