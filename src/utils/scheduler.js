/**
 * Temple Scheduling & Rule Calculation Engine
 * 
 * Rules:
 * 1. Check Special Dates (Admin/Custom date overrides)
 * 2. Check Festival Dates
 * 3. Fallback to Weekly Schedule
 * 
 * Prepares clean JSON output supporting multiple daily sessions, status badges
 * (OPEN, CLOSED, OPENING_SOON, CLOSING_SOON), next opening calculation,
 * and countdown metrics. Pluggable for Supabase / Firebase backend integrations.
 */

// Default Database Store (Mock / Initial State)
export const DEFAULT_SCHEDULE_STORE = {
  weeklySchedule: [
    {
      dayIndex: 0,
      dayName: 'Sunday',
      sessions: [
        { name: 'Morning', open: '05:00', close: '11:30' },
        { name: 'Evening', open: '16:30', close: '21:00' }
      ]
    },
    {
      dayIndex: 1,
      dayName: 'Monday',
      sessions: [
        { name: 'Morning', open: '05:00', close: '11:30' },
        { name: 'Evening', open: '16:30', close: '21:00' }
      ]
    },
    {
      dayIndex: 2,
      dayName: 'Tuesday',
      sessions: [
        { name: 'Morning', open: '05:00', close: '11:30' },
        { name: 'Evening', open: '16:30', close: '21:00' }
      ]
    },
    {
      dayIndex: 3,
      dayName: 'Wednesday',
      sessions: [
        { name: 'Morning', open: '05:00', close: '11:30' },
        { name: 'Evening', open: '16:30', close: '21:00' }
      ]
    },
    {
      dayIndex: 4,
      dayName: 'Thursday',
      sessions: [
        { name: 'Morning', open: '05:00', close: '11:30' },
        { name: 'Evening', open: '16:30', close: '21:00' }
      ]
    },
    {
      dayIndex: 5,
      dayName: 'Friday',
      sessions: [
        { name: 'Morning', open: '04:30', close: '12:00' },
        { name: 'Evening', open: '16:00', close: '22:00' }
      ]
    },
    {
      dayIndex: 6,
      dayName: 'Saturday',
      sessions: [
        { name: 'Morning', open: '05:00', close: '11:30' },
        { name: 'Evening', open: '16:30', close: '21:30' }
      ]
    }
  ],
  specialDates: [
    {
      date: '2026-08-01',
      title: 'Special Monthly Deity Alankaram',
      isClosedAllDay: false,
      sessions: [
        { name: 'Morning', open: '04:00', close: '12:30' },
        { name: 'Evening', open: '15:30', close: '22:30' }
      ]
    }
  ],
  festivalDates: [
    {
      date: '2026-07-31',
      title: 'Varalakshmi Vratam Festival',
      isClosedAllDay: false,
      sessions: [
        { name: 'Morning Special', open: '04:30', close: '13:30' },
        { name: 'Evening Special', open: '15:30', close: '22:30' }
      ]
    },
    {
      date: '2026-08-15',
      title: 'Sri Krishna Janmashtami',
      isClosedAllDay: false,
      sessions: [
        { name: 'Morning Special', open: '05:00', close: '13:00' },
        { name: 'Midnight Special Utsavam', open: '16:00', close: '23:30' }
      ]
    }
  ]
};

/**
 * Converts HH:MM 24hr string to minutes from midnight.
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Formats HH:MM 24hr string to 12hr AM/PM display string.
 */
export const formatTime12Hr = (timeStr) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mStr} ${ampm}`;
};

/**
 * Helper to format date object to YYYY-MM-DD
 */
export const formatDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Precedence Rule Resolver:
 * Rule 1: Special Dates override
 * Rule 2: Festival Dates override
 * Rule 3: Weekly Schedule fallback
 */
export const getScheduleForDate = (dateObj, store = DEFAULT_SCHEDULE_STORE) => {
  const dateKey = formatDateKey(dateObj);
  const dayIndex = dateObj.getDay();

  // Rule 1: Special Date Check
  const specialMatch = store.specialDates.find(s => s.date === dateKey);
  if (specialMatch) {
    return {
      source: 'SPECIAL_DATE',
      ruleApplied: 'Rule 1: Special Date Override',
      title: specialMatch.title,
      date: dateKey,
      isClosedAllDay: Boolean(specialMatch.isClosedAllDay),
      sessions: specialMatch.sessions || []
    };
  }

  // Rule 2: Festival Date Check
  const festivalMatch = store.festivalDates.find(f => f.date === dateKey);
  if (festivalMatch) {
    return {
      source: 'FESTIVAL_DATE',
      ruleApplied: 'Rule 2: Festival Date Override',
      title: festivalMatch.title,
      date: dateKey,
      isClosedAllDay: Boolean(festivalMatch.isClosedAllDay),
      sessions: festivalMatch.sessions || []
    };
  }

  // Rule 3: Standard Weekly Schedule
  const weeklyMatch = store.weeklySchedule.find(w => w.dayIndex === dayIndex) || store.weeklySchedule[0];
  return {
    source: 'WEEKLY_SCHEDULE',
    ruleApplied: 'Rule 3: Standard Weekly Schedule',
    title: `Standard ${weeklyMatch.dayName} Schedule`,
    date: dateKey,
    isClosedAllDay: false,
    sessions: weeklyMatch.sessions || []
  };
};

/**
 * Core Calculator Engine:
 * Returns clean, frontend-ready JSON containing status, countdowns, next opening,
 * and current session metrics.
 */
export const calculateTempleStatus = (nowInput = new Date(), store = DEFAULT_SCHEDULE_STORE) => {
  const now = new Date(nowInput);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  const todayDateKey = formatDateKey(now);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[now.getDay()];

  // Resolve today's schedule via Precedence Rules
  const todaysSchedule = getScheduleForDate(now, store);

  // Prepare formatted sessions for today
  const formattedTodaySessions = todaysSchedule.sessions.map(s => ({
    name: s.name,
    open: formatTime12Hr(s.open),
    close: formatTime12Hr(s.close),
    rawOpen: s.open,
    rawClose: s.close
  }));

  // Handle Full Day Closure (e.g. emergency or maintenance)
  if (todaysSchedule.isClosedAllDay || todaysSchedule.sessions.length === 0) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowSchedule = getScheduleForDate(tomorrow, store);
    const tomorrowFirstSession = tomorrowSchedule.sessions[0];

    return {
      timestamp: now.toISOString(),
      date: todayDateKey,
      dayOfWeek,
      status: 'CLOSED',
      isOpen: false,
      isClosed: true,
      isOpeningSoon: false,
      isClosingSoon: false,
      activeSession: null,
      todaysTimings: {
        source: todaysSchedule.source,
        ruleApplied: todaysSchedule.ruleApplied,
        title: todaysSchedule.title,
        isClosedAllDay: true,
        sessions: []
      },
      nextOpeningTime: tomorrowFirstSession ? {
        formatted: `Tomorrow at ${formatTime12Hr(tomorrowFirstSession.open)}`,
        date: formatDateKey(tomorrow),
        sessionName: tomorrowFirstSession.name,
        rawOpen: tomorrowFirstSession.open
      } : null,
      countdown: {
        type: 'CLOSED_ALL_DAY',
        text: 'Closed for today',
        totalSecondsRemaining: 0
      }
    };
  }

  // Evaluate against today's multiple sessions
  let isOpen = false;
  let activeSession = null;
  let upcomingSessionToday = null;
  let remainingSessionSeconds = 0;
  let secondsUntilNextOpening = 0;
  let nextOpeningInfo = null;

  for (let i = 0; i < todaysSchedule.sessions.length; i++) {
    const s = todaysSchedule.sessions[i];
    const sOpenMin = timeToMinutes(s.open);
    const sCloseMin = timeToMinutes(s.close);

    if (currentMinutes >= sOpenMin && currentMinutes < sCloseMin) {
      // Currently Inside this Session
      isOpen = true;
      activeSession = {
        name: s.name,
        open: formatTime12Hr(s.open),
        close: formatTime12Hr(s.close),
        rawOpen: s.open,
        rawClose: s.close
      };
      
      const diffMin = sCloseMin - currentMinutes;
      remainingSessionSeconds = (diffMin * 60) - currentSeconds;
      break;
    } else if (currentMinutes < sOpenMin && !upcomingSessionToday) {
      // First upcoming session today
      upcomingSessionToday = {
        name: s.name,
        open: formatTime12Hr(s.open),
        close: formatTime12Hr(s.close),
        rawOpen: s.open,
        rawClose: s.close
      };
      const diffMin = sOpenMin - currentMinutes;
      secondsUntilNextOpening = (diffMin * 60) - currentSeconds;
      nextOpeningInfo = {
        formatted: `Today at ${formatTime12Hr(s.open)}`,
        date: todayDateKey,
        sessionName: s.name,
        rawOpen: s.open
      };
    }
  }

  // Determine Status Badges (OPEN, CLOSING_SOON, OPENING_SOON, CLOSED)
  let status = 'CLOSED';
  let isOpeningSoon = false;
  let isClosingSoon = false;

  if (isOpen) {
    // Check if closing within 30 minutes (1800 seconds)
    if (remainingSessionSeconds <= 1800) {
      isClosingSoon = true;
      status = 'CLOSING_SOON';
    } else {
      status = 'OPEN';
    }
  } else {
    if (upcomingSessionToday) {
      // Check if opening within 30 minutes (1800 seconds)
      if (secondsUntilNextOpening <= 1800) {
        isOpeningSoon = true;
        status = 'OPENING_SOON';
      } else {
        status = 'CLOSED';
      }
    } else {
      // Past all sessions today -> Calculate Tomorrow's First Session
      status = 'CLOSED';
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowSchedule = getScheduleForDate(tomorrow, store);
      const tomorrowFirstSession = tomorrowSchedule.sessions[0];

      if (tomorrowFirstSession) {
        const tOpenMin = timeToMinutes(tomorrowFirstSession.open);
        const minutesLeftToday = (24 * 60) - currentMinutes;
        const totalWaitMin = minutesLeftToday + tOpenMin;
        secondsUntilNextOpening = (totalWaitMin * 60) - currentSeconds;

        nextOpeningInfo = {
          formatted: `Tomorrow at ${formatTime12Hr(tomorrowFirstSession.open)}`,
          date: formatDateKey(tomorrow),
          sessionName: tomorrowFirstSession.name,
          rawOpen: tomorrowFirstSession.open
        };
      }
    }
  }

  // Format countdown string helper
  const formatSecondsToDHMS = (totalSec) => {
    if (totalSec <= 0) return '00m 00s';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    
    if (h > 0) return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    return `${pad(m)}m ${pad(s)}s`;
  };

  const countdownText = isOpen 
    ? `Closes in ${formatSecondsToDHMS(remainingSessionSeconds)}` 
    : `Opens in ${formatSecondsToDHMS(secondsUntilNextOpening)}`;

  // Construct Final Clean JSON Object
  return {
    timestamp: now.toISOString(),
    date: todayDateKey,
    dayOfWeek,
    status, // 'OPEN' | 'CLOSED' | 'OPENING_SOON' | 'CLOSING_SOON'
    isOpen,
    isClosed: !isOpen,
    isOpeningSoon,
    isClosingSoon,
    activeSession,
    todaysTimings: {
      source: todaysSchedule.source,
      ruleApplied: todaysSchedule.ruleApplied,
      title: todaysSchedule.title,
      isClosedAllDay: false,
      sessions: formattedTodaySessions
    },
    nextOpeningTime: nextOpeningInfo,
    countdown: {
      type: isOpen ? 'CLOSING' : 'OPENING',
      text: countdownText,
      totalSecondsRemaining: isOpen ? remainingSessionSeconds : secondsUntilNextOpening
    }
  };
};

/**
 * Backend Data Integration Adapter Interface:
 * Structured for easy swapping to Supabase, Firebase, or custom REST APIs.
 */
export const fetchScheduleData = async (apiClient = null) => {
  if (apiClient && typeof apiClient.getSchedule === 'function') {
    // Example: Backend / Supabase API Integration
    // return await apiClient.getSchedule();
    return await apiClient.getSchedule();
  }
  
  // Default to Local React Store
  return DEFAULT_SCHEDULE_STORE;
};
