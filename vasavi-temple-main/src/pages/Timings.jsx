import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Info, AlertTriangle, Check, Sparkles, Calendar, Layers } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useApp } from '../context/AppContext'
import { formatTime12Hr } from '../utils/scheduler'

// Standard weekly timing schedule
const STANDARD_SCHEDULE = [
  { dayIndex: 0, dayName: 'Sunday', morningOpen: '06:00', morningClose: '12:30', eveningOpen: '16:00', eveningClose: '20:30' },
  { dayIndex: 1, dayName: 'Monday', morningOpen: '06:00', morningClose: '12:30', eveningOpen: '16:00', eveningClose: '20:30' },
  { dayIndex: 2, dayName: 'Tuesday', morningOpen: '06:00', morningClose: '12:30', eveningOpen: '16:00', eveningClose: '20:30' },
  { dayIndex: 3, dayName: 'Wednesday', morningOpen: '06:00', morningClose: '12:30', eveningOpen: '16:00', eveningClose: '20:30' },
  { dayIndex: 4, dayName: 'Thursday', morningOpen: '06:00', morningClose: '12:30', eveningOpen: '16:00', eveningClose: '20:30' },
  { dayIndex: 5, dayName: 'Friday', morningOpen: '05:00', morningClose: '12:00', eveningOpen: '16:00', eveningClose: '21:30' }, // Friday Special
  { dayIndex: 6, dayName: 'Saturday', morningOpen: '06:00', morningClose: '12:30', eveningOpen: '16:00', eveningClose: '21:00' }, // Saturday Extended
]

// Mock Festival Overrides
const FESTIVAL_OVERRIDES = [
  {
    date: '2026-07-31', // Example: Friday
    festivalName: 'Varalakshmi Vratam Special',
    morningOpen: '04:30',
    morningClose: '13:30',
    eveningOpen: '15:30',
    eveningClose: '22:30'
  },
  {
    date: '2026-08-15',
    festivalName: 'Sri Krishna Janmashtami',
    morningOpen: '05:00',
    morningClose: '13:00',
    eveningOpen: '16:00',
    eveningClose: '23:30'
  }
]

const Timings = () => {
  const { scheduleJSON, scheduleStore } = useApp()
  const [loading, setLoading] = useState(false)

  // Real-time status display state driven directly from AppContext scheduleJSON
  const [liveStatus, setLiveStatus] = useState({
    isOpen: false,
    text: 'Loading...',
    subText: '',
    badgeColor: 'bg-gray-200 text-gray-700',
    activeScheduleSource: 'Standard Schedule'
  })

  // Sync liveStatus whenever scheduleJSON ticks from AppContext
  useEffect(() => {
    if (!scheduleJSON) return

    const isOpen = scheduleJSON.isOpen
    const sourceTitle = scheduleJSON.todaysTimings?.title 
      ? `${scheduleJSON.todaysTimings.title} (${scheduleJSON.todaysTimings.ruleApplied})`
      : (scheduleJSON.todaysTimings?.ruleApplied || 'Standard Schedule')

    let statusText = 'CLOSED NOW'
    let badgeColor = 'bg-red-500/10 text-red-600 border border-red-500/20'

    if (isOpen) {
      statusText = 'OPEN NOW'
      badgeColor = 'bg-green-500 text-white shadow-lg shadow-green-500/20 animate-pulse'
    } else if (scheduleJSON.todaysTimings?.isClosedAllDay) {
      statusText = 'CLOSED ALL DAY'
      badgeColor = 'bg-red-600 text-white font-bold'
    }

    setLiveStatus({
      isOpen,
      text: statusText,
      subText: scheduleJSON.countdown?.text || (isOpen ? 'Open for Darshan' : 'Temple Closed'),
      badgeColor,
      activeScheduleSource: sourceTitle
    })
  }, [scheduleJSON])

  // Check if a schedule row represents today
  const isToday = (dayIdx) => {
    return new Date().getDay() === dayIdx
  }

  // Get active override (Special Date or Festival) for a specific dayIndex in the current week
  const getOverrideForDay = (targetDayIndex) => {
    const now = new Date()
    const currentDayIndex = now.getDay()
    const diff = targetDayIndex - currentDayIndex
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + diff)

    const y = targetDate.getFullYear()
    const m = String(targetDate.getMonth() + 1).padStart(2, '0')
    const d = String(targetDate.getDate()).padStart(2, '0')
    const dateKey = `${y}-${m}-${d}`

    const specialMatch = scheduleStore?.specialDates?.find(s => s.date === dateKey)
    if (specialMatch) return { type: 'SPECIAL', data: specialMatch }

    const festivalMatch = scheduleStore?.festivalDates?.find(f => f.date === dateKey)
    if (festivalMatch) return { type: 'FESTIVAL', data: festivalMatch }

    return null
  }

  // Format visual timing displays cleanly (e.g. 06:00 -> 6:00 AM)
  const formatTimeText = (timeStr) => {
    if (!timeStr) return '--'
    const [hStr, mStr] = timeStr.split(':')
    const h = Number(hStr)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 === 0 ? 12 : h % 12
    return `${displayH}:${mStr} ${ampm}`
  }

  return (
    <PageTransition>
      <div className="py-12 md:py-20 px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-temple-gold font-semibold tracking-widest text-xs md:text-sm uppercase mb-2 block">Visitor Guide</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-temple-charcoal mb-4">
            Darshan Timings & Hours
          </h1>
          <p className="text-sm md:text-base text-temple-charcoal-light font-serif">
            View standard visiting hours, special puja schedules, and real-time temple opening calculations. Plan your visit to Sree Vasavi Temple.
          </p>
        </div>

        {loading ? (
          /* Loading Skeleton */
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-temple-gold border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold tracking-wider text-temple-charcoal-light font-sans uppercase animate-pulse">
                Fetching Sacred Timings...
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left side: Live countdown and alerts */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              {/* Live Status Card */}
              <div className="bg-white border border-temple-gold/25 rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-temple-gold"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-temple-charcoal font-semibold text-base">
                    <Clock className="w-5 h-5 text-temple-gold animate-pulse" />
                    <span>Real-time Status</span>
                  </div>
                  {/* Glowing dynamic badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${liveStatus.badgeColor}`}>
                    {liveStatus.text}
                  </span>
                </div>

                <div className="bg-temple-cream/80 border border-temple-gold/15 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-temple-charcoal/50 uppercase tracking-widest block font-sans">
                    Live Timing Countdown
                  </span>
                  <span className="text-sm md:text-lg font-bold font-mono text-temple-maroon block mt-1">
                    {liveStatus.subText}
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-2.5 text-xs text-temple-charcoal-light">
                  <Info className="w-4 h-4 text-temple-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-temple-charcoal">Source:</span>{' '}
                    <span className="font-mono text-temple-maroon bg-temple-maroon/5 px-1.5 py-0.5 rounded">
                      {liveStatus.activeScheduleSource}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Schedule Announcements */}
              <div className="bg-temple-maroon/5 border border-temple-maroon/20 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-temple-maroon font-bold text-base">
                  <Sparkles className="w-5 h-5 text-temple-gold" />
                  <span>Auspicious Day Overrides</span>
                </div>
                
                <p className="text-xs text-temple-charcoal-light leading-relaxed">
                  During festivals, timings are automatically updated with earlier opening windows to facilitate standard queues.
                </p>

                <div className="flex flex-col gap-3 mt-1">
                  {/* Admin Special Dates */}
                  {scheduleStore?.specialDates?.map((st) => (
                    <div key={st.date} className="p-3 bg-amber-50/80 border border-temple-gold/40 rounded-xl flex flex-col gap-1 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-temple-maroon">{st.title}</span>
                        <span className="bg-temple-gold text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Active Override</span>
                      </div>
                      <div className="text-[10px] text-temple-charcoal-light font-mono mt-0.5">
                        Date: {st.date}
                      </div>
                      {st.isClosedAllDay ? (
                        <span className="text-xs font-bold text-red-600 mt-1">● Closed All Day</span>
                      ) : (
                        <div className="text-xs grid grid-cols-2 gap-1 text-temple-charcoal mt-1 border-t border-dotted border-temple-gold/30 pt-1.5 font-mono">
                          <div>Morning: {formatTime12Hr(st.sessions[0]?.open)} - {formatTime12Hr(st.sessions[0]?.close)}</div>
                          <div>Evening: {formatTime12Hr(st.sessions[1]?.open)} - {formatTime12Hr(st.sessions[1]?.close)}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Standard Festival Dates */}
                  {scheduleStore?.festivalDates?.map((fest) => (
                    <div key={fest.date} className="p-3 bg-white border border-temple-maroon/10 rounded-xl flex flex-col gap-1 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-temple-maroon">{fest.title}</span>
                        <span className="bg-temple-gold/10 text-temple-gold font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">Festival</span>
                      </div>
                      <div className="text-[10px] text-temple-charcoal-light font-mono mt-1">
                        Date: {fest.date}
                      </div>
                      <div className="text-xs grid grid-cols-2 gap-1 text-temple-charcoal mt-1 border-t border-dotted border-gray-100 pt-1.5 font-mono">
                        <div>Morning: {formatTime12Hr(fest.sessions[0]?.open)} - {formatTime12Hr(fest.sessions[0]?.close)}</div>
                        <div>Evening: {formatTime12Hr(fest.sessions[1]?.open)} - {formatTime12Hr(fest.sessions[1]?.close)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Weekly timing displays */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Desktop Table (Visible lg and above) */}
              <div className="hidden md:block bg-white border border-temple-gold/15 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white font-display text-sm tracking-wider">
                      <th className="py-4 px-6 font-semibold">Weekday</th>
                      <th className="py-4 px-6 font-semibold">Morning Session</th>
                      <th className="py-4 px-6 font-semibold">Evening Session</th>
                      <th className="py-4 px-6 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-temple-gold/10 text-sm">
                    {(scheduleStore?.weeklySchedule || STANDARD_SCHEDULE).map((day) => {
                      const today = isToday(day.dayIndex)
                      const dayOverride = getOverrideForDay(day.dayIndex)
                      const activeSessions = dayOverride ? dayOverride.data.sessions : day.sessions
                      const isClosed = dayOverride ? Boolean(dayOverride.data.isClosedAllDay) : false
                      const specialTitle = dayOverride ? (dayOverride.data.title || dayOverride.data.festivalName) : null

                      const morningStr = activeSessions && activeSessions[0]
                        ? (activeSessions[0].open?.includes('AM') || activeSessions[0].open?.includes('PM') ? `${activeSessions[0].open} - ${activeSessions[0].close}` : `${formatTime12Hr(activeSessions[0].open)} - ${formatTime12Hr(activeSessions[0].close)}`)
                        : '--'

                      const eveningStr = activeSessions && activeSessions[1]
                        ? (activeSessions[1].open?.includes('AM') || activeSessions[1].open?.includes('PM') ? `${activeSessions[1].open} - ${activeSessions[1].close}` : `${formatTime12Hr(activeSessions[1].open)} - ${formatTime12Hr(activeSessions[1].close)}`)
                        : '--'

                      return (
                        <tr 
                          key={day.dayIndex}
                          className={`transition-all duration-300 ${
                            today 
                              ? 'bg-temple-gold/10 border-l-4 border-l-temple-gold relative font-semibold text-temple-maroon' 
                              : (dayOverride ? 'bg-amber-50/40 font-medium text-temple-maroon' : 'hover:bg-temple-cream/40 text-temple-charcoal-light')
                          }`}
                        >
                          <td className="py-4.5 px-6 font-medium">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                {day.dayName}
                                {today && (
                                  <span className="bg-temple-gold text-white font-sans font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Today
                                  </span>
                                )}
                                {dayOverride && !today && (
                                  <span className="bg-amber-500 text-white font-sans font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Special
                                  </span>
                                )}
                              </div>
                              {specialTitle && (
                                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                                  ★ {specialTitle}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4.5 px-6 font-mono">
                            {isClosed ? 'CLOSED ALL DAY' : morningStr}
                          </td>
                          <td className="py-4.5 px-6 font-mono">
                            {isClosed ? 'CLOSED ALL DAY' : eveningStr}
                          </td>
                          <td className="py-4.5 px-6 text-center">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${today ? (liveStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500') : (dayOverride ? 'bg-amber-500' : 'bg-gray-300')}`} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (Visible below md) */}
              <div className="md:hidden flex flex-col gap-4">
                {(scheduleStore?.weeklySchedule || STANDARD_SCHEDULE).map((day) => {
                  const today = isToday(day.dayIndex)
                  const dayOverride = getOverrideForDay(day.dayIndex)
                  const activeSessions = dayOverride ? dayOverride.data.sessions : day.sessions
                  const isClosed = dayOverride ? Boolean(dayOverride.data.isClosedAllDay) : false
                  const specialTitle = dayOverride ? (dayOverride.data.title || dayOverride.data.festivalName) : null

                  const morningStr = activeSessions && activeSessions[0]
                    ? (activeSessions[0].open?.includes('AM') || activeSessions[0].open?.includes('PM') ? `${activeSessions[0].open} - ${activeSessions[0].close}` : `${formatTime12Hr(activeSessions[0].open)} - ${formatTime12Hr(activeSessions[0].close)}`)
                    : '--'

                  const eveningStr = activeSessions && activeSessions[1]
                    ? (activeSessions[1].open?.includes('AM') || activeSessions[1].open?.includes('PM') ? `${activeSessions[1].open} - ${activeSessions[1].close}` : `${formatTime12Hr(activeSessions[1].open)} - ${formatTime12Hr(activeSessions[1].close)}`)
                    : '--'

                  return (
                    <div 
                      key={day.dayIndex}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-3 bg-white relative ${
                        today 
                          ? 'border-temple-gold shadow-md ring-1 ring-temple-gold/20' 
                          : (dayOverride ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-temple-gold/10 shadow-sm')
                      }`}
                    >
                      {today && (
                        <div className="absolute top-4 right-4 bg-temple-gold text-white font-sans font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Today
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-0.5 border-b border-gray-100 pb-2">
                        <span className={`font-display text-base font-bold ${today ? 'text-temple-maroon' : 'text-temple-charcoal'}`}>
                          {day.dayName}
                        </span>
                        {specialTitle && (
                          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                            ★ {specialTitle}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-wider text-temple-charcoal/50">Morning Session</span>
                          <span className="font-semibold font-mono text-temple-charcoal-light">
                            {isClosed ? 'CLOSED ALL DAY' : morningStr}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-wider text-temple-charcoal/50">Evening Session</span>
                          <span className="font-semibold font-mono text-temple-charcoal-light">
                            {isClosed ? 'CLOSED ALL DAY' : eveningStr}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default Timings
