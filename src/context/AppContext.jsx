import React, { createContext, useContext, useState, useEffect } from 'react'
import { calculateTempleStatus, DEFAULT_SCHEDULE_STORE } from '../utils/scheduler'
import {
  saveCloudData,
  fetchRemoteCloudData,
  subscribeToCloud,
  STORAGE_KEYS
} from '../services/db'

const AppContext = createContext(undefined)

// ── Default / Seed Data ───────────────────────────────────────────────────────

export const INITIAL_GALLERY_ITEMS = [
  {
    id: 'g1',
    title: 'Majestic Main Gopuram',
    category: 'Temple',
    description: 'Golden hour perspective of our traditional South Indian gopuram with intricate sacred carvings.',
    image: 'https://images.unsplash.com/photo-1608958416713-ef377227443e?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-square'
  },
  {
    id: 'g2',
    title: 'Sree Vasavi Devi Alankaram',
    category: 'Poojas',
    description: 'Special silk and gold ornament decoration during Friday morning Archana rituals.',
    image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[3/4]'
  },
  {
    id: 'g3',
    title: 'Navarathri Deepotsavam',
    category: 'Festivals',
    description: 'Thousands of glowing oil lamps illuminating the temple courtyard on Vijayadasami.',
    image: 'https://images.unsplash.com/photo-1602613977505-11996517af5e?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[4/3]'
  },
  {
    id: 'g4',
    title: 'New Annadanam Hall Progress',
    category: 'Construction',
    description: 'Ongoing development of our multi-purpose dining hall to serve free meals to 5,000 pilgrims daily.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186244f?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[16/9]'
  },
  {
    id: 'g5',
    title: 'Inner Sanctum Sanctity',
    category: 'Temple',
    description: 'Serene atmosphere of the inner shrine before morning Suprabhatam prayers.',
    image: 'https://images.unsplash.com/photo-1609137144813-7d722d56a2cb?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-square'
  },
  {
    id: 'g6',
    title: 'Special Kumkum Archana Seva',
    category: 'Poojas',
    description: 'Devotees offering sacred vermilion powders during the annual Varalakshmi Vratam.',
    image: 'https://images.unsplash.com/photo-1609137144675-9b2f2b3806eb?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[4/3]'
  },
  {
    id: 'g7',
    title: 'Utlotsavam Dahi Handi',
    category: 'Festivals',
    description: 'Youth celebrating Krishna Janmashtami with traditional pot breaking rituals.',
    image: 'https://images.unsplash.com/photo-1617135671158-989e51b4e868?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[3/4]'
  },
  {
    id: 'g8',
    title: 'Rajagopuram Stone Carvings',
    category: 'Construction',
    description: 'Artisans hand-crafting granite stone pillars for the new East Tower expansion.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[4/3]'
  },
  {
    id: 'g9',
    title: 'Temple Courtyard Illumination',
    category: 'Temple',
    description: 'Atmospheric evening view showing lit pradakshina pathways.',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[16/9]'
  },
  {
    id: 'g10',
    title: 'Diwali Lamp Lightings',
    category: 'Festivals',
    description: 'Sacred diyas arranged in traditional rangoli patterns across the main hall.',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-square'
  },
  {
    id: 'g11',
    title: 'Maha Rudra Abhishekam',
    category: 'Poojas',
    description: 'High priests performing holy bath rituals with Panchamrit and sacred flowers.',
    image: 'https://images.unsplash.com/photo-1602613977505-11996517af5e?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[3/4]'
  },
  {
    id: 'g12',
    title: 'Gopuram Tower Gold Plating',
    category: 'Construction',
    description: 'Consecration preparations for the new Kalasam gold-gilding ceremony.',
    image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
    aspect: 'aspect-[4/3]'
  }
]

export const DEFAULT_CONTACT_DETAILS = {
  phone: '+91 88888 99999',
  whatsapp: '+91 99999 88888',
  email: 'contact@vasavitemple.org',
  workingHours: '6:00 AM - 12:30 PM | 4:00 PM - 8:30 PM',
  address: 'Main Bazar Road, Sree Vasavi Sanctum Complex, Penugonda, Andhra Pradesh, India.',
  googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3817.752005058017!2d81.8079729!3d16.888158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37bd006577cc1b%3A0x72511491942ab40!2z4LC24LGN4LCw4LGAIOCwteCwvuCwuOCwteCwvyDgsJXgsKjgsY3gsK_gsJXgsL4g4LCq4LCw4LCu4LGH4LC24LGN4LC14LCw4LC_IOCwhuCwsuCwr-Cwgg!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  googleMapsShareUrl: 'https://maps.app.goo.gl/Uh59h8TafZxFuwhn9',
  youtubeUrl: 'https://youtube.com',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  whatsappChannelUrl: 'https://whatsapp.com'
}

export const DEFAULT_ABOUT_DETAILS = {
  subTitle: 'Sacred History & Heritage',
  title: 'Sree Vasavi Kanyaka Parameswari Devi',
  heroImage: '/temple-hero.jpg',
  introText: 'Discover the divine story of Goddess Vasavi Devi, the sacred birthplace of Penugonda kshetram, and the timeless message of Ahimsa and Dharmic devotion.',
  storyTitle: 'The Sacred Legend of Penugonda Kshetram',
  storyContent: 'Sree Vasavi Kanyaka Parameswari Devi is revered as an embodiment of Goddess Parvati. Born to King Kusuma Shresthi and Kousalyamamba in Penugonda, she exemplified supreme wisdom, compassion, and divine purity from early childhood. To prevent bloodshed and uphold non-violence (Ahimsa), Goddess Vasavi entered the sacred fire (Agni Pravesam) along with 102 Gotra couples. Her eternal sacrifice sanctified Penugonda as the divine Moolakshetram, inspiring millions worldwide.',
  values: [
    { title: 'Ahimsa & Peace', description: 'Promoting non-violence, universal harmony, and compassion across humanity.' },
    { title: 'Dharmic Heritage', description: 'Preserving ancient Vedic traditions, sacred rituals, and spiritual purity.' },
    { title: 'Nitya Annadanam', description: 'Serving free daily meals and supporting education and welfare for all pilgrims.' }
  ],
  timeline: [
    { year: '11th Century', title: 'Divine Avatar in Penugonda', description: 'Goddess Vasavi Devi lived in Penugonda, establishing the sacred values of Ahimsa and Atma Tyagam.' },
    { year: '1975', title: 'Sanctum & Gopuram Consecration', description: 'Rebuilding of the main sanctum and gilding of sacred temple gopurams.' },
    { year: '2026', title: 'Modern Pilgrim Amenities & Annadanam', description: 'Expanding facilities to serve over 5,000 pilgrims daily with free meals and digital seva.' }
  ],
  managementTitle: 'Penugonda Vasavi Devasthanam Trust',
  managementDescription: 'The temple is managed with complete devotion, transparency, and service by the governing trust committee dedicated to preserving sacred traditions and serving devotees.'
}

export const DEFAULT_DONATION_STORE = {
  title: "Sacred E-Donations & Seva (UPI / PhonePe)",
  subtitle: "Scan the official temple UPI QR code or copy UPI ID to donate",
  upiId: "vasavitemple@ybl",
  payeeName: "Sree Vasavi Kanyaka Parameswari Devasthanam",
  customQrUrl: "",
  accountName: "Sree Vasavi Devasthanam Trust",
  accountNumber: "3829 0100 0048 291",
  bankName: "State Bank of India, Penugonda",
  ifscCode: "SBIN0002781",
  taxExemptionNote: "All monetary contributions to Penugonda Vasavi Devasthanam Trust are eligible for tax deduction benefits under Section 80G of the Indian Income Tax Act."
}

// ── AppProvider ───────────────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Language preference is the ONLY thing kept in localStorage (harmless UX preference)
    return localStorage.getItem('vasavi_temple_lang') || 'EN'
  })

  const [activeNotification, setActiveNotification] = useState({
    show: true,
    message: "Special Abhishekam booking is open for upcoming Sravana Shukravaram.",
    type: "info"
  })

  const [visitorCount] = useState(120485)

  // All data stores — initialized with defaults, populated from backend on mount
  const [galleryStore, setGalleryStore] = useState(INITIAL_GALLERY_ITEMS)
  const [contactStore, setContactStore] = useState(DEFAULT_CONTACT_DETAILS)
  const [aboutStore, setAboutStore] = useState(DEFAULT_ABOUT_DETAILS)
  const [donationStore, setDonationStore] = useState(DEFAULT_DONATION_STORE)
  const [scheduleStore, setScheduleStore] = useState(DEFAULT_SCHEDULE_STORE)
  const [scheduleJSON, setScheduleJSON] = useState(() => calculateTempleStatus(new Date(), DEFAULT_SCHEDULE_STORE))

  // Track whether backend data has loaded (to avoid flash of stale default content)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // ── On mount: fetch all data from the Render backend ─────────────────────────
  useEffect(() => {
    fetchRemoteCloudData()
      .then(data => {
        // If backend returned data, update states directly here as a safety net
        // (subscribeToCloud below also handles it — this is for initial load)
        if (data) {
          if (data[STORAGE_KEYS.GALLERY])  setGalleryStore(data[STORAGE_KEYS.GALLERY])
          if (data[STORAGE_KEYS.CONTACT])  setContactStore(data[STORAGE_KEYS.CONTACT])
          if (data[STORAGE_KEYS.ABOUT])    setAboutStore(data[STORAGE_KEYS.ABOUT])
          if (data[STORAGE_KEYS.DONATION]) setDonationStore(data[STORAGE_KEYS.DONATION])
          if (data[STORAGE_KEYS.SCHEDULE]) setScheduleStore(data[STORAGE_KEYS.SCHEDULE])
        }
        setIsDataLoaded(true)
      })
      .catch(() => setIsDataLoaded(true))
  }, [])

  // ── Subscribe to real-time pub/sub (for instant Admin → website sync) ─────────
  // When Admin saves (saveCloudData), it notifies listeners → state updates instantly
  useEffect(() => {
    const unsubscribe = subscribeToCloud(({ key, data }) => {
      if (key === STORAGE_KEYS.GALLERY)  setGalleryStore(data)
      if (key === STORAGE_KEYS.CONTACT)  setContactStore(data)
      if (key === STORAGE_KEYS.ABOUT)    setAboutStore(data)
      if (key === STORAGE_KEYS.DONATION) setDonationStore(data)
      if (key === STORAGE_KEYS.SCHEDULE) setScheduleStore(data)
    })
    return () => unsubscribe()
  }, [])

  // ── Language preference ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('vasavi_temple_lang', language)
  }, [language])

  // ── Live schedule tick ────────────────────────────────────────────────────────
  useEffect(() => {
    const updateSchedule = () => {
      const newStatus = calculateTempleStatus(new Date(), scheduleStore)
      setScheduleJSON(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newStatus)) return prev
        return newStatus
      })
    }
    updateSchedule()
    const timer = setInterval(updateSchedule, 1000)
    return () => clearInterval(timer)
  }, [scheduleStore])

  // ── Update handlers (Admin → backend + instant state update) ─────────────────
  const updateGalleryStore = (newGallery) => {
    setGalleryStore(newGallery)
    saveCloudData(STORAGE_KEYS.GALLERY, newGallery)
  }

  const updateContactStore = (newDetails) => {
    setContactStore(newDetails)
    saveCloudData(STORAGE_KEYS.CONTACT, newDetails)
  }

  const updateAboutStore = (newDetails) => {
    setAboutStore(newDetails)
    saveCloudData(STORAGE_KEYS.ABOUT, newDetails)
  }

  const updateDonationStore = (newStore) => {
    setDonationStore(newStore)
    saveCloudData(STORAGE_KEYS.DONATION, newStore)
  }

  const updateScheduleStore = (newStore) => {
    setScheduleStore(newStore)
    saveCloudData(STORAGE_KEYS.SCHEDULE, newStore)
  }

  const dismissNotification = () => setActiveNotification(prev => ({ ...prev, show: false }))
  const changeLanguage = (lang) => setLanguage(lang)

  return (
    <AppContext.Provider value={{
      language,
      changeLanguage,
      activeNotification,
      dismissNotification,
      visitorCount,
      scheduleJSON,
      scheduleStore,
      updateScheduleStore,
      galleryStore,
      updateGalleryStore,
      contactStore,
      updateContactStore,
      aboutStore,
      updateAboutStore,
      donationStore,
      updateDonationStore,
      isDataLoaded
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
