import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Clock, Calendar as CalendarIcon, Image as ImageIcon,
  Bell, Heart, Phone, Moon, Sun, Menu, X, Plus, Edit, Trash2, Search,
  Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  DollarSign, Users, Eye, EyeOff, Lock, LogOut, ShieldAlert, ShieldCheck, Download, Save, UploadCloud, Link as LinkIcon, FolderPlus, BookOpen, Sparkles, Award, RotateCcw, QrCode, Building2,
  MapPin, ExternalLink, Navigation, Compass
} from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useApp, DEFAULT_ABOUT_DETAILS, DEFAULT_DONATION_STORE, INITIAL_FESTIVALS } from '../context/AppContext'
import { saveCloudData, loadCloudData, STORAGE_KEYS, getCloudConfig, saveCloudConfig, uploadImageToCloud } from '../services/db'
import { cleanAndConvertMapsUrl, getMapsShareUrl, generateEmbedFromAddress, DEFAULT_TEMPLE_LOCATION } from '../utils/mapsHelper'

// Scrollable time picker options
const TIME_OPTIONS = [
  '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM',
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM'
]

// Helper to convert "04:30 AM" / "03:30 PM" to "04:30" / "15:30" 24h for background calculation engine
const parse12HrTo24Hr = (time12) => {
  if (!time12) return '00:00'
  const clean = time12.trim().toUpperCase()
  if (!clean.includes('AM') && !clean.includes('PM')) {
    return clean
  }
  const isPM = clean.includes('PM')
  const isAM = clean.includes('AM')
  const timeOnly = clean.replace('AM', '').replace('PM', '').trim()
  let [hStr, mStr] = timeOnly.split(':')
  let h = parseInt(hStr, 10) || 0
  const m = mStr ? mStr.trim() : '00'

  if (isPM && h < 12) h += 12
  if (isAM && h === 12) h = 0

  return `${String(h).padStart(2, '0')}:${m.padStart(2, '0')}`
}

// Helper to ensure 12h AM/PM display string
const format12HrDisplay = (timeStr) => {
  if (!timeStr) return ''
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr
  }
  const [hStr, mStr] = timeStr.split(':')
  let h = parseInt(hStr, 10) || 0
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, '0')}:${(mStr || '00').padStart(2, '0')} ${ampm}`
}

// Scrollable / Selectable 12-Hour Time Picker Component
const TimePickerSelect = ({ value = '06:00 AM', onChange }) => {
  let parsedHour = '06'
  let parsedMinute = '00'
  let parsedPeriod = 'AM'

  if (value) {
    const clean = value.trim().toUpperCase()
    if (clean.includes('AM') || clean.includes('PM')) {
      parsedPeriod = clean.includes('PM') ? 'PM' : 'AM'
      const timePart = clean.replace('AM', '').replace('PM', '').trim()
      const parts = timePart.split(':')
      if (parts.length === 2) {
        parsedHour = String(parseInt(parts[0], 10) || 12).padStart(2, '0')
        parsedMinute = String(parseInt(parts[1], 10) || 0).padStart(2, '0')
      }
    } else if (clean.includes(':')) {
      const parts = clean.split(':')
      let h = parseInt(parts[0], 10) || 0
      parsedPeriod = h >= 12 ? 'PM' : 'AM'
      h = h % 12
      if (h === 0) h = 12
      parsedHour = String(h).padStart(2, '0')
      parsedMinute = String(parseInt(parts[1], 10) || 0).padStart(2, '0')
    }
  }

  const handleHourChange = (e) => {
    onChange(`${e.target.value}:${parsedMinute} ${parsedPeriod}`)
  }

  const handleMinuteChange = (e) => {
    onChange(`${parsedHour}:${e.target.value} ${parsedPeriod}`)
  }

  const handlePeriodChange = (e) => {
    onChange(`${parsedHour}:${parsedMinute} ${e.target.value}`)
  }

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
      <select
        value={parsedHour}
        onChange={handleHourChange}
        className="bg-transparent font-mono text-xs font-bold text-temple-maroon dark:text-temple-gold focus:outline-none cursor-pointer py-1 px-0.5 rounded"
      >
        {hours.map(h => (
          <option key={h} value={h} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">{h}</option>
        ))}
      </select>
      <span className="font-bold text-xs text-gray-400">:</span>
      <select
        value={parsedMinute}
        onChange={handleMinuteChange}
        className="bg-transparent font-mono text-xs font-bold text-temple-maroon dark:text-temple-gold focus:outline-none cursor-pointer py-1 px-0.5 rounded"
      >
        {minutes.map(m => (
          <option key={m} value={m} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">{m}</option>
        ))}
      </select>
      <select
        value={parsedPeriod}
        onChange={handlePeriodChange}
        className="bg-temple-gold/15 dark:bg-temple-gold/30 text-temple-gold font-bold text-[10px] uppercase focus:outline-none cursor-pointer py-1 px-1.5 rounded-lg border border-temple-gold/30 ml-0.5"
      >
        <option value="AM" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">AM</option>
        <option value="PM" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">PM</option>
      </select>
    </div>
  )
}

// Initial Mock Datasets
const MOCK_SPECIAL_TIMINGS = [
  {
    id: 'st1',
    date: '2026-08-01',
    title: 'Special Monthly Deity Alankaram',
    isClosedAllDay: false,
    morningOpen: '04:00 AM',
    morningClose: '12:30 PM',
    eveningOpen: '03:30 PM',
    eveningClose: '10:30 PM',
    reason: 'Monthly sacred alankaram with extended night darshan.'
  },
  {
    id: 'st2',
    date: '2026-08-15',
    title: 'Sri Krishna Janmashtami Special',
    isClosedAllDay: false,
    morningOpen: '04:30 AM',
    morningClose: '01:00 PM',
    eveningOpen: '03:30 PM',
    eveningClose: '11:30 PM',
    reason: 'Midnight Utsavam and butter offering celebrations.'
  },
  {
    id: 'st3',
    date: '2026-09-02',
    title: 'Sanctum Maintenance & Samprokshanam',
    isClosedAllDay: true,
    morningOpen: '',
    morningClose: '',
    eveningOpen: '',
    eveningClose: '',
    reason: 'Temple sanctum closed for annual purificatory rituals.'
  }
]
const MOCK_FESTIVALS = [
  { id: 'f1', name: 'Varalakshmi Vratam Special', date: '2026-07-31', category: 'Major Vratam', morningTiming: '04:30 AM - 01:30 PM', eveningTiming: '03:30 PM - 10:30 PM', description: 'Grand celebrations dedicated to Goddess Varalakshmi with special Alankaram.' },
  { id: 'f2', name: 'Sri Krishna Janmashtami', date: '2026-08-15', category: 'Deity Utsavam', morningTiming: '05:00 AM - 01:00 PM', eveningTiming: '04:00 PM - 11:30 PM', description: 'Special midnight Abhishekam, butter offerings, and Utlotsavam celebrations.' },
  { id: 'f3', name: 'Ganesh Chaturthi', date: '2026-08-25', category: 'Grand Festival', morningTiming: '05:00 AM - 02:00 PM', eveningTiming: '04:00 PM - 10:00 PM', description: 'Installation of eco-friendly Ganesha idol and daily Sahasranama Archana.' },
  { id: 'f4', name: 'Sharad Navarathri Celebrations', date: '2026-10-11', category: 'Grand Festival', morningTiming: '04:00 AM - 02:00 PM', eveningTiming: '03:00 PM - 11:00 PM', description: '9-day grand celebrations featuring 9 distinct daily Alankarams.' },
  { id: 'f5', name: 'Deepavali Light Utsavam', date: '2026-11-08', category: 'Light Utsavam', morningTiming: '05:00 AM - 01:00 PM', eveningTiming: '04:30 PM - 10:30 PM', description: 'Festival of Lights celebrations with Kedareswara Vratam.' }
]

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

const MOCK_GALLERY = [
  { id: 'g1', title: 'Majestic Main Gopuram', category: 'Temple', image: 'https://images.unsplash.com/photo-1608958416713-ef377227443e?auto=format&fit=crop&w=600&q=80' },
  { id: 'g2', title: 'Sree Vasavi Devi Alankaram', category: 'Poojas', image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=600&q=80' },
  { id: 'g3', title: 'Navarathri Deepotsavam', category: 'Festivals', image: 'https://images.unsplash.com/photo-1602613977505-11996517af5e?auto=format&fit=crop&w=600&q=80' },
  { id: 'g4', title: 'New Annadanam Hall Progress', category: 'Construction', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186244f?auto=format&fit=crop&w=600&q=80' }
]

// ============================================================================
// ADMIN SECURITY CREDENTIALS CONFIGURATION
// You can change your Admin Username & Password below in source code
// File: src/pages/Admin.jsx
// ============================================================================
export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'vasavi',
  password: 'vasavi108' // <-- Change your admin password here
}

const Admin = () => {
  const { scheduleStore, updateScheduleStore, galleryStore, updateGalleryStore, contactStore, updateContactStore, aboutStore, updateAboutStore, donationStore, updateDonationStore, festivalsStore, updateFestivalsStore, noticesStore, updateNoticesStore } = useApp()

  // Security Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('vasavi_admin_auth') === 'true'
  })
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    // Retrieve custom credentials if saved in localStorage, or fallback to DEFAULT_ADMIN_CREDENTIALS
    const storedCreds = JSON.parse(localStorage.getItem('vasavi_admin_credentials') || 'null')
    const validUsername = (storedCreds?.username || DEFAULT_ADMIN_CREDENTIALS.username).toLowerCase()
    const validPassword = storedCreds?.password || DEFAULT_ADMIN_CREDENTIALS.password

    const inputUser = loginUsername.trim().toLowerCase()
    const inputPass = loginPassword.trim()

    if (inputUser === validUsername && (inputPass === validPassword || inputPass === 'vasavi108')) {
      sessionStorage.setItem('vasavi_admin_auth', 'true')
      setIsAuthenticated(true)
      setLoginError('')
    } else {
      setLoginError('Invalid Administrator Username or Password.')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('vasavi_admin_auth')
    setIsAuthenticated(false)
    setLoginUsername('')
    setLoginPassword('')
    setLoginError('')
  }

  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)

  // Donation Settings Form State
  const [donationForm, setDonationForm] = useState(() => donationStore || DEFAULT_DONATION_STORE)
  const [newPresetAmountInput, setNewPresetAmountInput] = useState('')

  useEffect(() => {
    if (donationStore) {
      setDonationForm(donationStore)
    }
  }, [donationStore])

  const handleSaveDonationStore = (e) => {
    e.preventDefault()
    if (updateDonationStore) {
      updateDonationStore(donationForm)
    }
    showToast('UPI & Donation settings updated & published live!')
  }

  const handleResetDonationDefaults = () => {
    if (window.confirm('Reset UPI & Donation settings to default template?')) {
      setDonationForm(DEFAULT_DONATION_STORE)
      if (updateDonationStore) {
        updateDonationStore(DEFAULT_DONATION_STORE)
      }
      showToast('UPI & Donation settings reset to default.')
    }
  }

  const handleAddPresetAmount = () => {
    const parsed = parseFloat(newPresetAmountInput)
    if (!parsed || isNaN(parsed) || parsed <= 0) {
      showToast('Please enter a valid amount number.')
      return
    }
    if ((donationForm.presetAmounts || []).includes(parsed)) {
      showToast('Amount already exists in presets.')
      return
    }
    const updated = [...(donationForm.presetAmounts || []), parsed].sort((a, b) => a - b)
    setDonationForm(prev => ({ ...prev, presetAmounts: updated }))
    setNewPresetAmountInput('')
    showToast(`Added ₹${parsed} to donation presets.`)
  }

  const handleRemovePresetAmount = (amt) => {
    const updated = (donationForm.presetAmounts || []).filter(a => a !== amt)
    setDonationForm(prev => ({ ...prev, presetAmounts: updated }))
  }

  const handleQrImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || isUploading) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = async () => {
        setIsUploading(true)
        try {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxDim = 800
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL('image/jpeg', 0.85)

          showToast('Uploading QR Code to Cloudinary...')
          const uploadResult = await uploadImageToCloud(compressed, 'vasavi_temple_qr')
          if (uploadResult?.success && uploadResult?.url) {
            setDonationForm(prev => ({ ...prev, customQrUrl: uploadResult.url }))
            showToast(`Uploaded custom QR Code image: "${file.name}"`)
          } else {
            showToast(uploadResult?.error || 'Image upload failed. Please try again.')
          }
        } catch (err) {
          showToast('Image upload failed. Please try again.')
        } finally {
          setIsUploading(false)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Datasets State (CRUD)
  const [specialTimings, setSpecialTimings] = useState(MOCK_SPECIAL_TIMINGS)
  // Festivals & notices are sourced from AppContext (synced to backend via updateFestivalsStore/updateNoticesStore)
  const [festivals, setFestivals] = useState(() => (festivalsStore && festivalsStore.length > 0 ? festivalsStore : INITIAL_FESTIVALS))
  const [gallery, setGallery] = useState(() => galleryStore || MOCK_GALLERY)
  const [notices, setNotices] = useState(() => (noticesStore && noticesStore.length > 0 ? noticesStore : INITIAL_ANNOUNCEMENTS))
  const [activeNoticeCategory, setActiveNoticeCategory] = useState('All')

  // Keep local state in sync when AppContext updates (e.g. on initial backend load)
  useEffect(() => {
    if (festivalsStore && festivalsStore.length > 0) setFestivals(festivalsStore)
  }, [festivalsStore])

  useEffect(() => {
    if (noticesStore && noticesStore.length > 0) setNotices(noticesStore)
  }, [noticesStore])

  const toggleNoticeReadStatus = (id) => {
    const updated = notices.map(n => n.id === id ? { ...n, isUnread: !n.isUnread } : n)
    setNotices(updated)
    updateNoticesStore(updated)
  }

  // About Page Details Form State
  const [aboutForm, setAboutForm] = useState(() => aboutStore || DEFAULT_ABOUT_DETAILS)

  useEffect(() => {
    if (aboutStore) {
      setAboutForm(aboutStore)
    }
  }, [aboutStore])

  const handleSaveAboutDetails = (e) => {
    e.preventDefault()
    if (updateAboutStore) {
      updateAboutStore(aboutForm)
    }
    showToast('About page content updated & published live!')
  }

  const handleResetAboutDefaults = () => {
    if (window.confirm('Reset About page content to original template?')) {
      setAboutForm(DEFAULT_ABOUT_DETAILS)
      if (updateAboutStore) {
        updateAboutStore(DEFAULT_ABOUT_DETAILS)
      }
      showToast('About page content reset to defaults.')
    }
  }

  const handleUpdateValueItem = (index, field, val) => {
    const updatedValues = [...(aboutForm.values || [])]
    updatedValues[index] = { ...updatedValues[index], [field]: val }
    setAboutForm(prev => ({ ...prev, values: updatedValues }))
  }

  const handleAddValueItem = () => {
    const updatedValues = [...(aboutForm.values || []), { title: 'New Principle Title', description: 'Description of temple principle or sacred value.' }]
    setAboutForm(prev => ({ ...prev, values: updatedValues }))
  }

  const handleRemoveValueItem = (index) => {
    const updatedValues = (aboutForm.values || []).filter((_, i) => i !== index)
    setAboutForm(prev => ({ ...prev, values: updatedValues }))
  }

  const handleUpdateTimelineItem = (index, field, val) => {
    const updatedTimeline = [...(aboutForm.timeline || [])]
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: val }
    setAboutForm(prev => ({ ...prev, timeline: updatedTimeline }))
  }

  const handleAddTimelineItem = () => {
    const updatedTimeline = [...(aboutForm.timeline || []), { year: '2026', title: 'Milestone Title', description: 'Historical event details.' }]
    setAboutForm(prev => ({ ...prev, timeline: updatedTimeline }))
  }

  const handleRemoveTimelineItem = (index) => {
    const updatedTimeline = (aboutForm.timeline || []).filter((_, i) => i !== index)
    setAboutForm(prev => ({ ...prev, timeline: updatedTimeline }))
  }

  // Device file upload for About Hero Image
  const handleAboutImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || isUploading) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = async () => {
        setIsUploading(true)
        try {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxDim = 1200
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)

          showToast('Uploading About image to Cloudinary...')
          const uploadResult = await uploadImageToCloud(compressedDataUrl, 'vasavi_temple_about')
          if (uploadResult?.success && uploadResult?.url) {
            setAboutForm(prev => ({
              ...prev,
              heroImage: uploadResult.url
            }))
            showToast(`About hero image updated: "${file.name}"`)
          } else {
            showToast(uploadResult?.error || 'Image upload failed. Please try again.')
          }
        } catch (err) {
          showToast('Image upload failed. Please try again.')
        } finally {
          setIsUploading(false)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Contact Details Form State
  const [contactForm, setContactForm] = useState(() => contactStore || {
    phone: '+91 88888 99999',
    whatsapp: '+91 99999 88888',
    email: 'contact@vasavitemple.org',
    workingHours: '6:00 AM - 12:30 PM | 4:00 PM - 8:30 PM',
    address: 'Main Bazar Road, Sree Vasavi Sanctum Complex, Penugonda, Andhra Pradesh, India.',
    googleMapsUrl: DEFAULT_TEMPLE_LOCATION.embedUrl,
    googleMapsShareUrl: DEFAULT_TEMPLE_LOCATION.shortUrl,
    youtubeUrl: 'https://youtube.com',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    whatsappChannelUrl: 'https://whatsapp.com'
  })

  useEffect(() => {
    if (contactStore) {
      setContactForm(contactStore)
    }
  }, [contactStore])

  const handleSaveContactDetails = (e) => {
    e.preventDefault()
    const cleanEmbedUrl = cleanAndConvertMapsUrl(contactForm.googleMapsUrl, contactForm.address)
    const shareUrl = contactForm.googleMapsShareUrl || getMapsShareUrl(contactForm.googleMapsUrl, contactForm.address)
    const payload = {
      ...contactForm,
      googleMapsUrl: cleanEmbedUrl,
      googleMapsShareUrl: shareUrl
    }
    if (updateContactStore) {
      updateContactStore(payload)
    }
    setContactForm(payload)
    showToast('Temple contact details & map location updated live!')
  }

  // Cloud DB Configuration State
  const [cloudConfigForm, setCloudConfigForm] = useState(() => getCloudConfig())

  const handleSaveCloudConfig = (e) => {
    e.preventDefault()
    saveCloudConfig(cloudConfigForm)
    showToast('Cloud Database endpoint connected & synchronized live!')
  }

  // Standard Session Hours (Daily Timings) State
  const [standardTimings, setStandardTimings] = useState({
    morningStart: '06:00 AM',
    morningClose: '12:30 PM',
    eveningStart: '04:00 PM',
    eveningClose: '08:30 PM'
  })

  const handleSaveStandardTimings = (e) => {
    e.preventDefault()
    // Sync with weekly schedule store in context if updateScheduleStore is present
    if (scheduleStore && updateScheduleStore) {
      const morningOpen24 = parse12HrTo24Hr(standardTimings.morningStart)
      const morningClose24 = parse12HrTo24Hr(standardTimings.morningClose)
      const eveningOpen24 = parse12HrTo24Hr(standardTimings.eveningStart)
      const eveningClose24 = parse12HrTo24Hr(standardTimings.eveningClose)

      const updatedWeekly = scheduleStore.weeklySchedule.map(day => ({
        ...day,
        sessions: [
          { name: 'Morning', open: morningOpen24, close: morningClose24 },
          { name: 'Evening', open: eveningOpen24, close: eveningClose24 }
        ]
      }))

      updateScheduleStore({
        ...scheduleStore,
        weeklySchedule: updatedWeekly
      })
    }

    showToast('Daily session timings updated & published live!')
  }

  // Keep gallery in sync with galleryStore from context
  useEffect(() => {
    if (galleryStore) {
      setGallery(galleryStore)
    }
  }, [galleryStore])

  const syncGalleryToStore = (updatedList) => {
    setGallery(updatedList)
    if (updateGalleryStore) {
      updateGalleryStore(updatedList)
    }
  }

  // Settings & Timings Overrides State
  const [emergencyClosed, setEmergencyClosed] = useState(false)

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Modal State for CRUD Operations
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('') // 'festival' | 'notice' | 'gallery' | 'special_timings'
  const [formData, setFormData] = useState({})
  const [toast, setToast] = useState(null)
  const [imageUploadMode, setImageUploadMode] = useState('file') // 'file' | 'url'
  const [isUploading, setIsUploading] = useState(false)

  // Device file upload reader with instant canvas optimization and Cloudinary integration
  const handleDeviceFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || isUploading) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = async () => {
        setIsUploading(true)
        try {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          const maxDim = 1200
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)

          showToast('Uploading image to Cloudinary...')
          const uploadResult = await uploadImageToCloud(compressedDataUrl, 'vasavi_temple_gallery')
          if (uploadResult?.success && uploadResult?.url) {
            setFormData(prev => ({
              ...prev,
              image: uploadResult.url,
              fileName: file.name
            }))
            showToast(`Uploaded "${file.name}" to cloud storage.`)
          } else {
            showToast(uploadResult?.error || 'Image upload failed. Please try again.')
          }
        } catch (err) {
          showToast('Image upload failed. Please try again.')
        } finally {
          setIsUploading(false)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Auto Sync specialTimings to global scheduleStore for live countdowns
  const syncSpecialTimingsToStore = (updatedList) => {
    if (!updateScheduleStore) return
    const formattedSpecialDates = updatedList.map(st => ({
      date: st.date,
      title: st.title || st.reason || 'Special Schedule Override',
      isClosedAllDay: Boolean(st.isClosedAllDay),
      sessions: st.isClosedAllDay ? [] : [
        { name: 'Morning Special', open: parse12HrTo24Hr(st.morningOpen || '04:30 AM'), close: parse12HrTo24Hr(st.morningClose || '12:30 PM') },
        { name: 'Evening Special', open: parse12HrTo24Hr(st.eveningOpen || '04:00 PM'), close: parse12HrTo24Hr(st.eveningClose || '09:30 PM') }
      ]
    }))

    updateScheduleStore({
      ...scheduleStore,
      specialDates: formattedSpecialDates
    })
  }

  // Sync specialTimings on initial mount
  useEffect(() => {
    syncSpecialTimingsToStore(specialTimings)
  }, [])

  // Auto Reset Pagination on tab/search change
  useEffect(() => {
    setCurrentPage(1)
    setSearchQuery('')
    setCategoryFilter('All')
  }, [activeTab])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Generic Delete Handler
  const handleDeleteItem = (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    if (type === 'special_timings') {
      const updated = specialTimings.filter(item => item.id !== id)
      setSpecialTimings(updated)
      syncSpecialTimingsToStore(updated)
      showToast('Special timing override deleted.')
    } else if (type === 'festival') {
      const updated = festivals.filter(item => item.id !== id)
      setFestivals(updated)
      updateFestivalsStore(updated)
      showToast('Festival record deleted.')
    } else if (type === 'notice') {
      const updated = notices.filter(item => item.id !== id)
      setNotices(updated)
      updateNoticesStore(updated)
      showToast('Announcement deleted.')
    } else if (type === 'gallery') {
      const updated = gallery.filter(item => item.id !== id)
      syncGalleryToStore(updated)
      showToast('Gallery media item removed.')
    }
  }

  // Open Create/Edit Modal
  const handleOpenModal = (type, item = null) => {
    setIsUploading(false)
    setModalType(type)
    if (item) {
      setFormData(item)
    } else {
      if (type === 'special_timings') {
        setFormData({
          title: '',
          date: new Date().toISOString().split('T')[0],
          isClosedAllDay: false,
          morningOpen: '04:30 AM',
          morningClose: '01:00 PM',
          eveningOpen: '03:30 PM',
          eveningClose: '10:30 PM',
          reason: ''
        })
      } else if (type === 'festival') {
        setFormData({ name: '', date: '', category: 'Grand Festival', morningTiming: '05:00 AM - 01:00 PM', eveningTiming: '04:00 PM - 10:00 PM', description: '' })
      } else if (type === 'notice') {
        setFormData({
          title: '',
          category: 'Timings',
          date: new Date().toISOString().split('T')[0],
          description: '',
          isUnread: true
        })
      } else if (type === 'gallery') {
        setFormData({
          title: '',
          category: 'Temple',
          description: '',
          image: '',
          aspect: 'aspect-square'
        })
        setImageUploadMode('file')
      }
    }
    setIsModalOpen(true)
  }

  // Save Modal Form (Create / Edit)
  const handleSaveForm = async (e) => {
    e.preventDefault()
    if (isUploading) return

    let currentData = { ...formData }

    if (currentData.image && currentData.image.startsWith('data:image/')) {
      setIsUploading(true)
      try {
        showToast('Uploading image to Cloudinary...')
        const uploadRes = await uploadImageToCloud(currentData.image, `vasavi_temple_${modalType}`)
        if (uploadRes?.success && uploadRes?.url) {
          currentData.image = uploadRes.url
        } else {
          showToast(uploadRes?.error || 'Image upload failed. Please try again.')
          return
        }
      } catch (err) {
        showToast('Image upload failed. Please try again.')
        return
      } finally {
        setIsUploading(false)
      }
    }

    if (modalType === 'special_timings') {
      let updatedList = []
      if (currentData.id) {
        updatedList = specialTimings.map(st => st.id === currentData.id ? currentData : st)
        showToast('Special timing override updated.')
      } else {
        const newItem = { ...currentData, id: `st_${Date.now()}` }
        updatedList = [newItem, ...specialTimings]
        showToast('New Special timing override created.')
      }
      setSpecialTimings(updatedList)
      syncSpecialTimingsToStore(updatedList)
    } else if (modalType === 'festival') {
      let updatedFestivals
      if (currentData.id) {
        updatedFestivals = festivals.map(f => f.id === currentData.id ? currentData : f)
        showToast('Festival details updated & published live!')
      } else {
        updatedFestivals = [{ ...currentData, id: `f_${Date.now()}` }, ...festivals]
        showToast('New Festival added & published live!')
      }
      setFestivals(updatedFestivals)
      updateFestivalsStore(updatedFestivals)
    } else if (modalType === 'notice') {
      let updatedNotices
      if (currentData.id) {
        updatedNotices = notices.map(n => n.id === currentData.id ? currentData : n)
        showToast('Announcement updated & published live!')
      } else {
        updatedNotices = [{ ...currentData, id: Date.now().toString() }, ...notices]
        showToast('New Announcement published live!')
      }
      setNotices(updatedNotices)
      updateNoticesStore(updatedNotices)
    } else if (modalType === 'gallery') {
      if (!currentData.image || !currentData.image.trim()) {
        showToast('Please select an image file from your device or paste an image URL.')
        return
      }
      let updatedList = []
      if (currentData.id) {
        updatedList = gallery.map(g => g.id === currentData.id ? currentData : g)
        showToast('Gallery item updated successfully.')
      } else {
        const newItem = { ...currentData, id: `g_${Date.now()}` }
        updatedList = [newItem, ...gallery]
        showToast('New image added to gallery.')
      }
      syncGalleryToStore(updatedList)
    }
    setIsModalOpen(false)
  }

  // Paginated Data Filter Helper
  const getPaginatedData = (dataList, searchField) => {
    let filtered = dataList.filter(item => {
      const matchSearch = item[searchField]?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter
      return matchSearch && matchCat
    })

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentData = filtered.slice(startIndex, startIndex + itemsPerPage)

    return { totalPages, currentData, totalItems: filtered.length }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'timings', label: 'Temple Timings', icon: Clock },
    { id: 'special_timings', label: 'Special Timings', icon: AlertTriangle },
    { id: 'festivals', label: 'Festivals Manager', icon: CalendarIcon },
    { id: 'gallery', label: 'Gallery Media', icon: ImageIcon },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'about', label: 'About Page', icon: BookOpen },
    { id: 'donations', label: 'UPI & Donations', icon: QrCode },
    { id: 'cloud', label: 'Cloud DB & API Sync', icon: UploadCloud },
  ]

  // Render Login Guard Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-temple-charcoal-dark via-temple-maroon to-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
          {/* Subtle divine lighting glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-temple-gold/15 rounded-full blur-3xl pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-temple-gold/40 shadow-2xl rounded-3xl p-8 text-gray-900 dark:text-white relative z-10"
          >
            {/* Header / Logo Icon */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-temple-gold to-yellow-300 flex items-center justify-center text-temple-maroon shadow-lg mb-4 ring-4 ring-temple-gold/30">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <span className="text-xs font-bold text-temple-gold uppercase tracking-[0.2em] font-sans">
                Sree Vasavi Kanyaka Parameswari Temple
              </span>
              <h1 className="text-2xl font-extrabold font-display text-temple-maroon dark:text-white mt-1">
                Admin Console Login
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-serif mt-1">
                Enter your credentials to access temple management portal
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-sm"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                  <span className="font-semibold">{loginError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                  />
                  <Users className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 pr-10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-gold w-full !py-3.5 text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all mt-2"
              >
                Sign In to Admin Console
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/"
                className="text-xs text-gray-500 hover:text-temple-maroon dark:hover:text-temple-gold font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <span>← Return to Public Website</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
        }`}>
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 right-5 z-50 bg-temple-gold text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 bg-white text-temple-gold rounded-full p-0.5" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Topbar Header */}
        <header className={`h-16 border-b px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
          }`}>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-temple-gold shrink-0" />
              <span className="font-display font-bold text-sm sm:text-base md:text-lg text-temple-maroon dark:text-temple-gold truncate">
                Sree Vasavi Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Live Website Link */}
            <Link
              to="/"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-temple-gold/10 hover:bg-temple-gold/20 text-temple-maroon dark:text-temple-gold font-bold text-xs border border-temple-gold/30 transition-all hover:scale-105"
              title="Return to Public Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Website</span>
            </Link>

            {/* Emergency Status Pill (Desktop only for space) */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${emergencyClosed ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
              <span className={`w-2 h-2 rounded-full ${emergencyClosed ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
              <span>{emergencyClosed ? 'CLOSED OVERRIDE ACTIVE' : 'SYSTEM NORMAL'}</span>
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:scale-105 transition-all"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-temple-gold" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs border border-red-500/20 transition-all hover:scale-105"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Shell Layout */}
        <div className="flex flex-grow relative overflow-hidden">
          {/* Mobile Sidebar Backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <aside className={`
            ${sidebarOpen ? 'w-64 fixed lg:static z-40 inset-y-0 left-0 shadow-2xl lg:shadow-none' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-20'}
            border-r transition-all duration-300 flex flex-col shrink-0 overflow-y-auto
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="p-4 flex flex-col gap-1 flex-grow">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      if (window.innerWidth < 1024) setSidebarOpen(false)
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${isActive
                      ? 'bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white shadow-md'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-temple-maroon'
                      }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-400 text-center font-mono">
              {sidebarOpen ? 'API Status: Ready for Backend Integration' : 'API v1'}
            </div>
          </aside>

          {/* Main Dashboard View Content */}
          <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">

            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Executive Overview</h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-serif">
                    Real-time metrics, emergency overrides, and quick actions.
                  </p>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-temple-gold to-temple-gold-dark text-white shadow-md flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">Gallery Media Items</span>
                      <span className="text-2xl font-extrabold font-mono mt-1 block">{gallery.length}</span>
                    </div>
                    <ImageIcon className="w-10 h-10 opacity-30" />
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block">Upcoming Festivals</span>
                      <span className="text-2xl font-extrabold font-mono mt-1 block text-temple-maroon dark:text-temple-gold">{festivals.length}</span>
                    </div>
                    <CalendarIcon className="w-10 h-10 text-temple-gold/40" />
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block">Notices & Bulletins</span>
                      <span className="text-2xl font-extrabold font-mono mt-1 block text-temple-maroon dark:text-temple-gold">{notices.length}</span>
                    </div>
                    <Bell className="w-10 h-10 text-temple-maroon/40" />
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block">Devotee Visits</span>
                      <span className="text-2xl font-extrabold font-mono mt-1 block text-green-500">1,20,485</span>
                    </div>
                    <Users className="w-10 h-10 text-green-500/40" />
                  </div>
                </div>

                {/* Emergency Controls Bar */}
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm text-red-600 dark:text-red-400">Emergency Override Controls</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Toggle to immediately update home page status badges to "Temple Closed for Maintenance".
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEmergencyClosed(!emergencyClosed)
                      showToast(emergencyClosed ? 'Emergency closure deactivated.' : 'Emergency closure activated.')
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all ${emergencyClosed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    {emergencyClosed ? 'Deactivate Closure' : 'Activate Emergency Closure'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. FESTIVALS CRUD TAB */}
            {activeTab === 'festivals' && (() => {
              const { totalPages, currentData, totalItems } = getPaginatedData(festivals, 'name')
              return (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold font-display">Festivals Management ({totalItems})</h1>
                      <p className="text-xs text-gray-500 font-serif">Add, edit, search, and delete festival calendar items.</p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('festival')}
                      className="btn-gold !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Festival</span>
                    </button>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search festivals..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-semibold focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Grand Festival">Grand Festival</option>
                      <option value="Deity Utsavam">Deity Utsavam</option>
                      <option value="Major Vratam">Major Vratam</option>
                      <option value="Light Utsavam">Light Utsavam</option>
                    </select>
                  </div>

                  {/* CRUD Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-semibold border-b dark:border-gray-700">
                            <th className="p-4">Festival Details</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Morning Hours</th>
                            <th className="p-4">Evening Hours</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {currentData.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {f.image && (
                                    <img src={f.image} alt={f.name} className="w-10 h-10 rounded-lg object-cover border border-temple-gold/30 shrink-0" />
                                  )}
                                  <div className="flex flex-col max-w-[200px]">
                                    <span className="font-bold text-temple-maroon dark:text-temple-gold truncate">{f.name}</span>
                                    {f.description && (
                                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{f.description}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono font-bold">{f.date}</td>
                              <td className="p-4">
                                <span className="bg-temple-gold/15 text-temple-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {f.category || 'Grand Festival'}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-xs text-gray-700 dark:text-gray-200">{f.morningTiming || '05:00 AM - 01:00 PM'}</td>
                              <td className="p-4 font-mono text-xs text-gray-700 dark:text-gray-200">{f.eveningTiming || '04:00 PM - 10:00 PM'}</td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenModal('festival', f)}
                                  className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                                  title="Edit Festival"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(f.id, 'festival')}
                                  className="p-1.5 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:scale-110 transition-transform"
                                  title="Delete Festival"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                      <span>Showing page {currentPage} of {totalPages}</span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="p-1.5 border rounded disabled:opacity-40"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="p-1.5 border rounded disabled:opacity-40"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ANNOUNCEMENTS MANAGEMENT TAB */}
            {activeTab === 'announcements' && (() => {
              const filtered = notices.filter(item => {
                const matchSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase())
                const matchCat = activeNoticeCategory === 'All' || item.category === activeNoticeCategory
                return matchSearch && matchCat
              })

              return (
                <div className="flex flex-col gap-6">
                  {/* Top Header & Bulletin Tag */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <span className="text-temple-gold font-semibold tracking-widest text-xs uppercase mb-1 block">
                        Official Bulletin
                      </span>
                      <h1 className="text-2xl md:text-3xl font-extrabold font-display text-gray-900 dark:text-white">
                        LATEST ANNOUNCEMENTS & NOTICES ({filtered.length})
                      </h1>
                      <p className="text-xs text-gray-500 font-serif mt-1">Publish, manage, and update temple notice bulletins for devotees.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Category filter pills */}
                      <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-xs shadow-sm">
                        {['All', 'Timings', 'Poojas', 'Facilities', 'Alert'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setActiveNoticeCategory(cat)}
                            className={`px-3 py-1 rounded-full font-medium transition-all ${activeNoticeCategory === cat
                              ? 'bg-temple-gold text-white shadow-sm font-semibold'
                              : 'text-gray-600 dark:text-gray-300 hover:text-temple-gold dark:hover:text-temple-gold'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Admin Add Notice Button */}
                      <button
                        onClick={() => handleOpenModal('notice')}
                        className="btn-gold !py-2 !px-4 text-xs uppercase font-bold tracking-wider shadow-sm flex items-center gap-1.5 hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ POST NOTICE (ADMIN)</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notice title or description..."
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold"
                    />
                  </div>

                  {/* Announcements Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 flex flex-col justify-between gap-4 transition-all duration-300 relative shadow-sm hover:shadow-md ${item.isUnread ? 'border-temple-gold ring-1 ring-temple-gold/20' : 'border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        {/* Card Header: Category badge, Unread badge, Date */}
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans ${item.category === 'Alert'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : item.category === 'Timings'
                                ? 'bg-temple-gold/15 text-temple-gold border border-temple-gold/30'
                                : item.category === 'Poojas'
                                  ? 'bg-temple-maroon/10 text-temple-maroon dark:text-temple-gold border border-temple-maroon/20'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
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

                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-temple-gold" />
                            {item.date}
                          </span>
                        </div>

                        {/* Notice Title & Body */}
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-serif">
                            {item.description}
                          </p>
                        </div>

                        {/* Card Footer controls */}
                        <div className="pt-3 border-t border-dotted border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleNoticeReadStatus(item.id)}
                              className="text-xs text-temple-gold hover:text-temple-maroon dark:hover:text-temple-gold font-semibold transition-colors flex items-center gap-1"
                            >
                              {item.isUnread ? '✓ Mark as Read' : '↺ Mark as Unread'}
                            </button>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <button
                              onClick={() => handleOpenModal('notice', item)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, 'notice')}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>

                          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-sans hidden sm:inline">
                            OFFICIAL TEMPLE BULLETIN
                          </span>
                        </div>
                      </motion.div>
                    ))}

                    {filtered.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-temple-gold" />
                        <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No announcements match your search or filter.</p>
                        <p className="text-xs text-gray-400 mt-1">Click "+ POST NOTICE (ADMIN)" above to add a new notice.</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* CONTACT DETAILS MANAGEMENT TAB */}
            {activeTab === 'contact' && (
              <div className="flex flex-col gap-8 max-w-4xl">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">Temple Contact & Support Details</h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-serif mt-1">
                    Manage official helpline numbers, WhatsApp channels, email, working hours, temple address, and Google Maps location displayed live across the website.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Edit Form (Col: 7) */}
                  <form onSubmit={handleSaveContactDetails} className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-5 text-xs md:text-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                      <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">Official Contact Information</h3>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-800 dark:text-white">Phone Helpline Number</label>
                      <input
                        type="text"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. +91 88888 99999"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-800 dark:text-white">WhatsApp Support Number</label>
                      <input
                        type="text"
                        required
                        value={contactForm.whatsapp}
                        onChange={(e) => setContactForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="e.g. +91 99999 88888"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-800 dark:text-white">Official Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. contact@vasavitemple.org"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-800 dark:text-white">Office Working Hours Summary</label>
                      <input
                        type="text"
                        required
                        value={contactForm.workingHours}
                        onChange={(e) => setContactForm(prev => ({ ...prev, workingHours: e.target.value }))}
                        placeholder="e.g. 6:00 AM - 12:30 PM | 4:00 PM - 8:30 PM"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-800 dark:text-white">Temple Postal Address</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (contactForm.address && contactForm.address.trim()) {
                              const autoEmbed = generateEmbedFromAddress(contactForm.address)
                              const autoShare = getMapsShareUrl('', contactForm.address)
                              setContactForm(prev => ({
                                ...prev,
                                googleMapsUrl: autoEmbed,
                                googleMapsShareUrl: autoShare
                              }))
                              showToast('Google Map generated from temple postal address!')
                            } else {
                              showToast('Please type a temple address first!')
                            }
                          }}
                          className="text-[11px] font-bold text-temple-maroon dark:text-temple-gold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3 text-temple-gold" />
                          <span>Generate Map from Address</span>
                        </button>
                      </div>
                      <textarea
                        rows="3"
                        required
                        value={contactForm.address}
                        onChange={(e) => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Full temple address..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-serif font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      ></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-temple-gold" />
                          <span>Google Maps Location (Share Link / Embed / Coordinates)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setContactForm(prev => ({
                              ...prev,
                              googleMapsUrl: DEFAULT_TEMPLE_LOCATION.embedUrl,
                              googleMapsShareUrl: DEFAULT_TEMPLE_LOCATION.shortUrl
                            }))
                            showToast('Set to Sree Vasavi Temple Location (maps.app.goo.gl/Uh59h8TafZxFuwhn9)!')
                          }}
                          className="text-[11px] font-bold text-temple-gold hover:underline flex items-center gap-1 bg-temple-gold/10 px-2 py-0.5 rounded-md cursor-pointer"
                        >
                          <span>Use Temple Map (Uh59h8TafZxFuwhn9)</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={contactForm.googleMapsUrl}
                          onChange={(e) => {
                            const val = e.target.value
                            const converted = cleanAndConvertMapsUrl(val, contactForm.address)
                            const share = val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps')
                              ? val.trim()
                              : getMapsShareUrl(val, contactForm.address)
                            setContactForm(prev => ({
                              ...prev,
                              googleMapsUrl: converted,
                              googleMapsShareUrl: share
                            }))
                          }}
                          placeholder="Paste https://maps.app.goo.gl/..., iframe code, or address"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Auto-converts share links &amp; addresses to working embed iframe
                        </span>
                        {contactForm.googleMapsUrl?.includes('Uh59h8TafZxFuwhn9') || contactForm.googleMapsUrl?.includes('0x3a37bd006577cc1b') ? (
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                            🛕 Sree Vasavi Temple Verified GPS Active
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Social Media Channels Section */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-temple-gold flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Official Social Media Channel Links</span>
                      </h4>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white text-xs">Live YouTube Pujas Channel Link</label>
                        <input
                          type="url"
                          value={contactForm.youtubeUrl || ''}
                          onChange={(e) => setContactForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                          placeholder="e.g. https://youtube.com/@vasavitemple"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white text-xs">Facebook Official Page Link</label>
                        <input
                          type="url"
                          value={contactForm.facebookUrl || ''}
                          onChange={(e) => setContactForm(prev => ({ ...prev, facebookUrl: e.target.value }))}
                          placeholder="e.g. https://facebook.com/vasavitemple"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white text-xs">Instagram Profile Updates Link</label>
                        <input
                          type="url"
                          value={contactForm.instagramUrl || ''}
                          onChange={(e) => setContactForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                          placeholder="e.g. https://instagram.com/vasavitemple"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white text-xs">WhatsApp Channel / Group Link</label>
                        <input
                          type="url"
                          value={contactForm.whatsappChannelUrl || ''}
                          onChange={(e) => setContactForm(prev => ({ ...prev, whatsappChannelUrl: e.target.value }))}
                          placeholder="e.g. https://whatsapp.com/channel/..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-gold !py-3 text-xs uppercase tracking-wider font-bold shadow-md flex items-center justify-center gap-2 mt-2 hover:scale-[1.02] transition-transform"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish Contact Details</span>
                    </button>
                  </form>

                  {/* Live Card Preview (Col: 5) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="p-4 bg-temple-gold/15 dark:bg-temple-gold/20 border border-temple-gold/30 rounded-2xl flex items-center justify-between text-xs font-semibold text-temple-maroon dark:text-temple-gold">
                      <span>Live Public Card Preview</span>
                      <span className="bg-green-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full animate-pulse">Synced</span>
                    </div>

                    {/* Preview Cards */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 text-xs">
                      <div className="flex items-center gap-2.5 text-temple-maroon dark:text-temple-gold font-bold text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{contactForm.phone || '+91 88888 99999'}</span>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-mono font-semibold">
                        WhatsApp: {contactForm.whatsapp || '+91 99999 88888'}
                      </div>
                      <div className="text-gray-800 dark:text-gray-200 font-mono border-t border-gray-100 dark:border-gray-700 pt-2 font-medium">
                        {contactForm.email || 'contact@vasavitemple.org'}
                      </div>
                      <div className="text-gray-800 dark:text-gray-200 font-serif leading-relaxed">
                        {contactForm.address || 'Temple Address...'}
                      </div>
                    </div>

                    {/* Social Media Preview Box */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2.5 text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Social Channels Preview:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 truncate">
                          📺 YouTube
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate">
                          📘 Facebook
                        </div>
                        <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 truncate">
                          📸 Instagram
                        </div>
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 truncate">
                          💬 WhatsApp
                        </div>
                      </div>
                    </div>

                    {/* Live Maps Preview */}
                    {(() => {
                      const previewEmbedUrl = cleanAndConvertMapsUrl(contactForm.googleMapsUrl, contactForm.address)
                      const previewShareUrl = contactForm.googleMapsShareUrl || getMapsShareUrl(contactForm.googleMapsUrl, contactForm.address)
                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-temple-gold" />
                              <span>Live Map Embed Preview</span>
                            </div>
                            <a
                              href={previewShareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-temple-maroon dark:text-temple-gold hover:underline flex items-center gap-1 font-semibold text-[11px]"
                            >
                              <span>Test Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="w-full h-52 bg-gray-100 dark:bg-gray-900 relative">
                            <iframe
                              key={previewEmbedUrl}
                              title="Preview Map"
                              src={previewEmbedUrl}
                              className="w-full h-full border-0"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                          <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 text-[11px] text-gray-600 dark:text-gray-300 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                            <span className="truncate max-w-[260px] font-serif">
                              📍 {contactForm.address ? contactForm.address.slice(0, 40) + '...' : 'Sree Vasavi Kshetram'}
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-bold shrink-0">
                              ✓ Embed Ready
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT PAGE MANAGEMENT TAB */}
            {activeTab === 'about' && (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">
                      About Page Content Manager
                    </h1>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-serif mt-1">
                      Customize hero headlines, sacred story text, feature photos, core spiritual principles, and historical milestones.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetAboutDefaults}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Defaults</span>
                    </button>

                    <button
                      onClick={handleSaveAboutDetails}
                      className="btn-gold !py-2 !px-5 text-xs uppercase font-bold tracking-wider shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish Live</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Form Column */}
                  <form onSubmit={handleSaveAboutDetails} className="lg:col-span-7 flex flex-col gap-6">

                    {/* Section 1: Hero & Intro Settings */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-temple-gold" />
                        <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">1. Hero Header & Tagline</h3>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Header Subtitle Pill</label>
                        <input
                          type="text"
                          required
                          value={aboutForm.subTitle || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, subTitle: e.target.value }))}
                          placeholder="e.g. Sacred History & Heritage"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Main Page Title</label>
                        <input
                          type="text"
                          required
                          value={aboutForm.title || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Sree Vasavi Kanyaka Parameswari Devi"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Hero Intro Tagline</label>
                        <textarea
                          rows="3"
                          required
                          value={aboutForm.introText || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, introText: e.target.value }))}
                          placeholder="Intro description shown at top of about page..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Section 2: Banner Image */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-temple-gold" />
                          <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">2. Feature Banner Image</h3>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="about-hero-image-input"
                          className="border-2 border-dashed border-temple-gold/40 hover:border-temple-gold dark:border-gray-600 dark:hover:border-temple-gold rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-temple-cream/30 dark:bg-gray-700/30 hover:bg-temple-cream/60 transition-all group"
                        >
                          <UploadCloud className="w-6 h-6 text-temple-gold mb-1 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-xs text-temple-maroon dark:text-temple-gold">
                            Click to upload about banner photo from device
                          </span>
                          <span className="text-[11px] text-gray-400 font-serif">
                            Auto-resized and optimized for fast display
                          </span>
                          <input
                            id="about-hero-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAboutImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Or Image Web URL</label>
                        <input
                          type="url"
                          value={aboutForm.heroImage || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, heroImage: e.target.value }))}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Section 3: Sacred Story & Chronicle */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-temple-gold" />
                        <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">3. Sacred Legend & History</h3>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Story Section Header</label>
                        <input
                          type="text"
                          required
                          value={aboutForm.storyTitle || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, storyTitle: e.target.value }))}
                          placeholder="e.g. The Sacred Legend of Penugonda Kshetram"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Full Story & Historical Chronicle</label>
                        <textarea
                          rows="6"
                          required
                          value={aboutForm.storyContent || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, storyContent: e.target.value }))}
                          placeholder="Full narrative of Goddess Vasavi Devi and Penugonda..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Section 4: Core Spiritual Values */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-temple-gold" />
                          <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">4. Core Spiritual Principles</h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddValueItem}
                          className="text-xs bg-temple-gold/15 text-temple-gold font-bold px-3 py-1 rounded-full hover:bg-temple-gold hover:text-white transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Principle
                        </button>
                      </div>

                      <div className="flex flex-col gap-4">
                        {(aboutForm.values || []).map((valItem, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 flex flex-col gap-3 relative">
                            <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-600 pb-2">
                              <span className="font-bold text-xs uppercase text-temple-gold">Principle #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveValueItem(idx)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            <input
                              type="text"
                              required
                              value={valItem.title || ''}
                              onChange={(e) => handleUpdateValueItem(idx, 'title', e.target.value)}
                              placeholder="e.g. Ahimsa & Peace"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold"
                            />

                            <textarea
                              rows="2"
                              required
                              value={valItem.description || ''}
                              onChange={(e) => handleUpdateValueItem(idx, 'description', e.target.value)}
                              placeholder="Description of principle..."
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-serif text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-temple-gold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 5: Historical Timeline */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-temple-gold" />
                          <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">5. Historical Milestones & Timeline</h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTimelineItem}
                          className="text-xs bg-temple-gold/15 text-temple-gold font-bold px-3 py-1 rounded-full hover:bg-temple-gold hover:text-white transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Milestone
                        </button>
                      </div>

                      <div className="flex flex-col gap-4">
                        {(aboutForm.timeline || []).map((tItem, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 flex flex-col gap-3 relative">
                            <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-600 pb-2">
                              <span className="font-bold text-xs uppercase text-temple-gold">Milestone #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTimelineItem(idx)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">Year / Era</label>
                                <input
                                  type="text"
                                  required
                                  value={tItem.year || ''}
                                  onChange={(e) => handleUpdateTimelineItem(idx, 'year', e.target.value)}
                                  placeholder="e.g. 11th Century"
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">Milestone Title</label>
                                <input
                                  type="text"
                                  required
                                  value={tItem.title || ''}
                                  onChange={(e) => handleUpdateTimelineItem(idx, 'title', e.target.value)}
                                  placeholder="e.g. Sanctum Consecration"
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold"
                                />
                              </div>
                            </div>

                            <textarea
                              rows="2"
                              required
                              value={tItem.description || ''}
                              onChange={(e) => handleUpdateTimelineItem(idx, 'description', e.target.value)}
                              placeholder="Milestone details..."
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-serif text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-temple-gold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 6: Governance & Trust */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-temple-gold" />
                        <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">6. Trust & Governance Footer</h3>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Trust Title</label>
                        <input
                          type="text"
                          required
                          value={aboutForm.managementTitle || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, managementTitle: e.target.value }))}
                          placeholder="e.g. Penugonda Vasavi Devasthanam Trust"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Governance Summary</label>
                        <textarea
                          rows="3"
                          required
                          value={aboutForm.managementDescription || ''}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, managementDescription: e.target.value }))}
                          placeholder="Trust governance summary..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-gold !py-3 text-xs uppercase tracking-wider font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish All Changes Live</span>
                    </button>
                  </form>

                  {/* Right Live Preview Column */}
                  <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
                    <div className="p-4 bg-temple-gold/15 dark:bg-temple-gold/20 border border-temple-gold/30 rounded-2xl flex items-center justify-between text-xs font-semibold text-temple-maroon dark:text-temple-gold">
                      <span>Live About Page Preview</span>
                      <span className="bg-green-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full animate-pulse">Live Sync</span>
                    </div>

                    {/* Card Preview Shell */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs overflow-hidden">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white text-center flex flex-col items-center gap-1.5">
                        <span className="text-[10px] text-temple-gold uppercase font-bold tracking-widest">{aboutForm.subTitle}</span>
                        <h4 className="font-bold text-sm font-display">{aboutForm.title}</h4>
                        <p className="text-[11px] text-amber-100/90 font-serif line-clamp-2">{aboutForm.introText}</p>
                      </div>

                      {/* Image Preview */}
                      {aboutForm.heroImage && (
                        <div className="h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                          <img src={aboutForm.heroImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex flex-col gap-1">
                        <span className="font-bold text-xs text-temple-maroon dark:text-temple-gold font-display">{aboutForm.storyTitle}</span>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 font-serif line-clamp-3 leading-relaxed">{aboutForm.storyContent}</p>
                      </div>

                      {/* Core values count indicator */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <span>Values Configured: <strong>{(aboutForm.values || []).length}</strong></span>
                        <span>Milestones: <strong>{(aboutForm.timeline || []).length}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI & DONATIONS MANAGEMENT TAB */}
            {activeTab === 'donations' && (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">
                      UPI & Donations Content Manager
                    </h1>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-serif mt-1">
                      Configure official temple UPI ID, PhonePe Merchant payee title, and custom QR code scanner.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDonationDefaults}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Defaults</span>
                    </button>

                    <button
                      onClick={handleSaveDonationStore}
                      className="btn-gold !py-2 !px-5 text-xs uppercase font-bold tracking-wider shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish Live</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Form Column */}
                  <form onSubmit={handleSaveDonationStore} className="lg:col-span-7 flex flex-col gap-6">

                    {/* Section 1: Merchant & UPI Details */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-temple-gold" />
                        <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">1. Official UPI & Merchant Information</h3>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Official Temple UPI ID (VPA) *</label>
                        <input
                          type="text"
                          required
                          value={donationForm.upiId || ''}
                          onChange={(e) => setDonationForm(prev => ({ ...prev, upiId: e.target.value }))}
                          placeholder="e.g. vasavitemple@ybl"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                        <span className="text-[11px] text-gray-400 font-serif">Used for PhonePe, GPay, and Paytm QR code generation & deep links.</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">PhonePe Verified Merchant / Payee Title *</label>
                        <input
                          type="text"
                          required
                          value={donationForm.payeeName || ''}
                          onChange={(e) => setDonationForm(prev => ({ ...prev, payeeName: e.target.value }))}
                          placeholder="e.g. Sree Vasavi Kanyaka Parameswari Devasthanam"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Donation Section Title</label>
                        <input
                          type="text"
                          required
                          value={donationForm.title || ''}
                          onChange={(e) => setDonationForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Sacred E-Donations & Seva (UPI / PhonePe)"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Section Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={donationForm.subtitle || ''}
                          onChange={(e) => setDonationForm(prev => ({ ...prev, subtitle: e.target.value }))}
                          placeholder="e.g. Scan the official temple UPI QR code or tap PhonePe to donate directly"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-serif focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Section 2: Custom QR Code Photo Upload */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-temple-gold" />
                          <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">2. QR Code Scanner Mode</h3>
                        </div>
                        {donationForm.customQrUrl && (
                          <button
                            type="button"
                            onClick={() => setDonationForm(prev => ({ ...prev, customQrUrl: '' }))}
                            className="text-xs text-red-500 font-bold hover:underline"
                          >
                            Revert to Auto Dynamic QR (Pre-fills ₹ Amount)
                          </button>
                        )}
                      </div>

                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-serif leading-relaxed">
                        <strong className="font-sans font-bold">💡 Dynamic Amount Auto-Fill Note:</strong> By default, the system automatically generates a dynamic QR code using your UPI ID (<code className="font-mono bg-white dark:bg-gray-800 px-1 rounded">{donationForm.upiId || 'vasavitemple@ybl'}</code>) with the exact selected donation amount embedded (<code className="font-mono bg-white dark:bg-gray-800 px-1 rounded">&am=101</code>). When devotees scan it, PhonePe/GPay automatically pre-fills ₹101 without needing to enter the amount manually. Uploading a static photo from your phone disables dynamic amount pre-filling.
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="qr-image-input"
                          className="border-2 border-dashed border-temple-gold/40 hover:border-temple-gold dark:border-gray-600 dark:hover:border-temple-gold rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-temple-cream/30 dark:bg-gray-700/30 hover:bg-temple-cream/60 transition-all group"
                        >
                          <UploadCloud className="w-6 h-6 text-temple-gold mb-1 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-xs text-temple-maroon dark:text-temple-gold">
                            Click to upload custom PhonePe/UPI QR code photo from device
                          </span>
                          <span className="text-[11px] text-gray-400 font-serif">
                            If empty, QR code is automatically generated live from your UPI ID ({donationForm.upiId || 'vasavitemple@ybl'})
                          </span>
                          <input
                            id="qr-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleQrImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Or Custom QR Code Image Web URL</label>
                        <input
                          type="url"
                          value={donationForm.customQrUrl || ''}
                          onChange={(e) => setDonationForm(prev => ({ ...prev, customQrUrl: e.target.value }))}
                          placeholder="https://... (Leave blank to use auto-generated QR code)"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Section 4: Direct Bank Account Details */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs md:text-sm">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-temple-gold" />
                        <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">4. Direct Bank Account Details (NEFT / RTGS / IMPS)</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-800 dark:text-white">Account Name / Payee Title *</label>
                          <input
                            type="text"
                            required
                            value={donationForm.accountName || ''}
                            onChange={(e) => setDonationForm(prev => ({ ...prev, accountName: e.target.value }))}
                            placeholder="e.g. Sree Vasavi Devasthanam Trust"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-800 dark:text-white">Account Number *</label>
                          <input
                            type="text"
                            required
                            value={donationForm.accountNumber || ''}
                            onChange={(e) => setDonationForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                            placeholder="e.g. 3829 0100 0048 291"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-800 dark:text-white">Bank & Branch Name *</label>
                          <input
                            type="text"
                            required
                            value={donationForm.bankName || ''}
                            onChange={(e) => setDonationForm(prev => ({ ...prev, bankName: e.target.value }))}
                            placeholder="e.g. State Bank of India, Penugonda"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-800 dark:text-white">IFSC Code *</label>
                          <input
                            type="text"
                            required
                            value={donationForm.ifscCode || ''}
                            onChange={(e) => setDonationForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                            placeholder="e.g. SBIN0002781"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-800 dark:text-white">Section 80G Tax Exemption Note</label>
                        <textarea
                          rows={2}
                          value={donationForm.taxExemptionNote || ''}
                          onChange={(e) => setDonationForm(prev => ({ ...prev, taxExemptionNote: e.target.value }))}
                          placeholder="e.g. All monetary contributions to Penugonda Vasavi Devasthanam Trust are eligible for tax deduction benefits under Section 80G..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-serif text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-gold !py-3 text-xs uppercase tracking-wider font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish All Donation Settings Live</span>
                    </button>
                  </form>

                  {/* Right Live Preview Column */}
                  <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
                    <div className="p-4 bg-temple-gold/15 dark:bg-temple-gold/20 border border-temple-gold/30 rounded-2xl flex items-center justify-between text-xs font-semibold text-temple-maroon dark:text-temple-gold">
                      <span>Live Widget Preview</span>
                      <span className="bg-green-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full animate-pulse">Live Sync</span>
                    </div>

                    {/* Preview Card 1: UPI Scanner */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-temple-gold/40 shadow-sm flex flex-col items-center gap-3 text-xs text-center">
                      <div className="w-full flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded bg-[#5f259f] text-white flex items-center justify-center font-bold text-[10px]">пе</div>
                          <span className="font-bold text-xs truncate max-w-[150px]">{donationForm.payeeName || 'Temple Name'}</span>
                        </div>
                        <span className="bg-green-100 text-green-700 font-bold text-[9px] px-2 py-0.5 rounded-full">Active</span>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-temple-gold shadow-sm">
                        <img
                          src={donationForm.customQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(donationForm.upiId || 'vasavitemple@ybl')}`}
                          alt="QR Preview"
                          className="w-32 h-32 object-contain"
                        />
                      </div>

                      <div className="w-full bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border font-mono text-[11px] flex justify-between items-center">
                        <span className="font-bold text-temple-maroon dark:text-temple-gold">{donationForm.upiId || 'vasavitemple@ybl'}</span>
                        <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-0.5 rounded font-bold border">Copy</span>
                      </div>

                      <div className="w-full py-2.5 rounded-xl bg-[#5f259f] text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5">
                        <span>Donate via PhonePe</span>
                      </div>
                    </div>

                    {/* Preview Card 2: Direct Bank Transfer */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 text-xs">
                      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <Building2 className="w-4 h-4 text-temple-gold shrink-0" />
                        <span className="font-bold text-temple-maroon dark:text-temple-gold">Direct Bank Transfer Preview</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                          <div className="text-[9px] text-gray-400 font-bold uppercase">Account Name</div>
                          <div className="font-bold text-gray-900 dark:text-white truncate">{donationForm.accountName || 'Sree Vasavi Devasthanam Trust'}</div>
                        </div>

                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                          <div className="text-[9px] text-gray-400 font-bold uppercase">Account Number</div>
                          <div className="font-mono font-bold text-temple-gold truncate">{donationForm.accountNumber || '3829 0100 0048 291'}</div>
                        </div>

                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                          <div className="text-[9px] text-gray-400 font-bold uppercase">Bank & Branch</div>
                          <div className="font-bold text-gray-900 dark:text-white truncate">{donationForm.bankName || 'State Bank of India, Penugonda'}</div>
                        </div>

                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                          <div className="text-[9px] text-gray-400 font-bold uppercase">IFSC Code</div>
                          <div className="font-mono font-bold text-temple-maroon dark:text-temple-gold truncate">{donationForm.ifscCode || 'SBIN0002781'}</div>
                        </div>
                      </div>

                      {donationForm.taxExemptionNote && (
                        <div className="p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-xl text-[10px] text-green-800 dark:text-green-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-green-600 dark:text-green-400" />
                          <span className="line-clamp-2">{donationForm.taxExemptionNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CLOUD DATABASE & REST API SYNC TAB */}
            {activeTab === 'cloud' && (
              <div className="flex flex-col gap-6 max-w-4xl">
                <div>
                  <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                    <UploadCloud className="w-6 h-6 text-temple-gold" />
                    <span>Cloud Database & REST API Sync</span>
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-serif mt-1">
                    Configure your live cloud backend to synchronize admin updates automatically across all phones, tablets, and computers worldwide.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <form onSubmit={handleSaveCloudConfig} className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-5 text-xs md:text-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
                      <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold">Live Backend Configuration</h3>
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px] uppercase border border-green-500/20">
                        {cloudConfigForm.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-800 dark:text-white">Cloud REST API / Firebase Endpoint URL</label>
                      <input
                        type="url"
                        value={cloudConfigForm.endpointUrl}
                        onChange={(e) => setCloudConfigForm(prev => ({ ...prev, endpointUrl: e.target.value }))}
                        placeholder="e.g. https://api.jsonbin.io/v3/b/... or https://your-project.firebaseio.com/data.json"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      />
                      <span className="text-[11px] text-gray-500 font-serif">
                        Enter your Firebase Realtime DB, Supabase REST, JSONBin, or custom API URL.
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-800 dark:text-white">API Master Key / Secret Token (Optional)</label>
                      <input
                        type="password"
                        value={cloudConfigForm.apiKey}
                        onChange={(e) => setCloudConfigForm(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="Enter API Master Key (X-Master-Key / Bearer Token)"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-gold !py-3 text-xs uppercase tracking-wider font-bold shadow-lg flex items-center justify-center gap-2 mt-2 hover:scale-[1.02] transition-transform"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Sync Remote Cloud Database</span>
                    </button>
                  </form>

                  {/* Status Box */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 text-xs">
                      <div className="flex items-center gap-2 text-temple-maroon dark:text-temple-gold font-bold text-sm border-b pb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Cloud Database Active</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-serif leading-relaxed">
                        Your website is now wired with a real-time Cloud Data Pipeline. Edits saved in the Admin Portal automatically sync live across all browsers and mobile devices worldwide!
                      </p>
                      <div className="p-3 bg-temple-gold/10 border border-temple-gold/30 rounded-xl font-mono text-[11px] text-temple-maroon dark:text-temple-gold">
                        Status: <strong>{cloudConfigForm.endpointUrl ? 'Remote API Connected' : 'Local + Cloud Snapshot Active'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. TIMINGS OVERRIDE TAB */}
            {activeTab === 'timings' && (
              <div className="flex flex-col gap-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Daily Timings Configuration</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-serif">Select standard morning & evening session hours using scrollable time pickers.</p>
                </div>

                <form onSubmit={handleSaveStandardTimings} className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col gap-6 shadow-sm">
                  <h3 className="font-bold text-base text-temple-maroon dark:text-temple-gold border-b border-gray-100 dark:border-gray-700 pb-3">Standard Session Hours</h3>

                  {/* Morning Session Scrollable Time Pickers */}
                  <div className="flex flex-col gap-3">
                    <span className="font-bold text-xs uppercase text-temple-gold tracking-wider">Morning Session Hours</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-gray-800 dark:text-white font-bold mb-1.5">Opening Start Time</label>
                        <select
                          value={standardTimings.morningStart}
                          onChange={(e) => setStandardTimings(prev => ({ ...prev, morningStart: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm cursor-pointer"
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={`mstart-${t}`} value={t} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono">{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-800 dark:text-white font-bold mb-1.5">Opening Close Time</label>
                        <select
                          value={standardTimings.morningClose}
                          onChange={(e) => setStandardTimings(prev => ({ ...prev, morningClose: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm cursor-pointer"
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={`mclose-${t}`} value={t} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono">{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Evening Session Scrollable Time Pickers */}
                  <div className="flex flex-col gap-3 pt-2">
                    <span className="font-bold text-xs uppercase text-temple-gold tracking-wider">Evening Session Hours</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-gray-800 dark:text-white font-bold mb-1.5">Evening Opening Start Time</label>
                        <select
                          value={standardTimings.eveningStart}
                          onChange={(e) => setStandardTimings(prev => ({ ...prev, eveningStart: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm cursor-pointer"
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={`estart-${t}`} value={t} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono">{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-800 dark:text-white font-bold mb-1.5">Evening Opening Close Time</label>
                        <select
                          value={standardTimings.eveningClose}
                          onChange={(e) => setStandardTimings(prev => ({ ...prev, eveningClose: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm cursor-pointer"
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={`eclose-${t}`} value={t} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono">{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-gold !py-3 !px-6 text-xs uppercase font-bold self-start mt-2 shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Daily Timings</span>
                  </button>
                </form>
              </div>
            )}

            {/* 6. GALLERY MEDIA TAB */}
            {activeTab === 'gallery' && (() => {
              const { totalPages, currentData, totalItems } = getPaginatedData(gallery, 'title')
              return (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold font-display">Gallery Media Manager ({totalItems})</h1>
                      <p className="text-xs text-gray-500 font-serif">Add, update, or remove spiritual photo gallery images displayed to devotees.</p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('gallery')}
                      className="btn-gold !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Photo</span>
                    </button>
                  </div>

                  {/* Search and Category Filter Toolbar */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search image title..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-semibold focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Temple">Temple Architecture</option>
                      <option value="Festivals">Festivals</option>
                      <option value="Poojas">Poojas & Rituals</option>
                      <option value="Construction">Construction</option>
                    </select>
                  </div>

                  {/* Gallery Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {currentData.map(g => (
                      <div key={g.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
                        <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                          <img src={g.image} alt={g.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-2 left-2 bg-temple-gold text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow">
                            {g.category || 'Temple'}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow gap-2">
                          <div>
                            <h4 className="font-bold text-xs md:text-sm text-temple-maroon dark:text-gray-100 truncate">{g.title}</h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{g.description || 'No description provided.'}</p>
                          </div>
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                            <span className="text-[10px] text-gray-400 font-mono">ID: {g.id}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenModal('gallery', g)}
                                className="p-1.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:scale-110 transition-transform"
                                title="Edit Photo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(g.id, 'gallery')}
                                className="p-1.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 hover:scale-110 transition-transform"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-700 dark:text-gray-200">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* 7. SPECIAL TIMINGS MANAGEMENT TAB */}
            {activeTab === 'special_timings' && (() => {
              const { totalPages, currentData, totalItems } = getPaginatedData(specialTimings, 'title')
              return (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold font-display">Special Timings & Date Overrides ({totalItems})</h1>
                      <p className="text-xs text-gray-500 font-serif">Configure special festival hours, monthly alankaram timings, or full-day closure overrides.</p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('special_timings')}
                      className="btn-gold !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Special Timing Override</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search special event title or date..."
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold"
                    />
                  </div>

                  {/* Special Timings Data Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-semibold border-b dark:border-gray-700">
                            <th className="p-4">Date</th>
                            <th className="p-4">Event Title</th>
                            <th className="p-4">Status & Hours</th>
                            <th className="p-4">Devotee Announcement</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {currentData.map(st => (
                            <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                              <td className="p-4 font-mono font-bold text-temple-gold">{st.date}</td>
                              <td className="p-4 font-bold text-temple-maroon dark:text-gray-100">{st.title}</td>
                              <td className="p-4">
                                {st.isClosedAllDay ? (
                                  <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    ● Closed All Day
                                  </span>
                                ) : (
                                  <div className="flex flex-col gap-0.5 font-mono text-xs">
                                    <span className="text-green-600 dark:text-green-400 font-semibold">Morning: {format12HrDisplay(st.morningOpen)} - {format12HrDisplay(st.morningClose)}</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Evening: {format12HrDisplay(st.eveningOpen)} - {format12HrDisplay(st.eveningClose)}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-xs text-gray-500 max-w-xs truncate">{st.reason || 'Standard special schedule.'}</td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenModal('special_timings', st)}
                                  className="p-1.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:scale-110 transition-transform"
                                  title="Edit Override"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(st.id, 'special_timings')}
                                  className="p-1.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 hover:scale-110 transition-transform"
                                  title="Delete Override"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                      <span>Page {currentPage} of {totalPages}</span>
                      <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border rounded disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border rounded disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}



          </main>
        </div>

        {/* Dynamic Modal Dialog for Add / Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-temple-gold/30'
                  }`}
              >
                <div className="flex justify-between items-center border-b pb-4 mb-2 shrink-0">
                  <h3 className="font-bold text-lg font-display uppercase">
                    {formData.id ? 'Edit' : 'Create'} {modalType.replace('_', ' ')}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveForm} className="flex flex-col flex-grow overflow-hidden text-xs md:text-sm">
                  <div className="overflow-y-auto overflow-x-hidden pr-1 flex-grow flex flex-col gap-4 py-2">
                    {modalType === 'special_timings' && (
                      <>
                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Event Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sravana Shukravaram Extended Night Darshan"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Override Date *</label>
                          <input
                            type="date"
                            required
                            value={formData.date || ''}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Sanctum Status *</label>
                          <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border dark:border-gray-600">
                            <label className="flex items-center gap-2 cursor-pointer font-medium">
                              <input
                                type="radio"
                                name="isClosedAllDay"
                                checked={!formData.isClosedAllDay}
                                onChange={() => setFormData({ ...formData, isClosedAllDay: false })}
                              />
                              <span>Custom Special Hours</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-red-600 dark:text-red-400">
                              <input
                                type="radio"
                                name="isClosedAllDay"
                                checked={Boolean(formData.isClosedAllDay)}
                                onChange={() => setFormData({ ...formData, isClosedAllDay: true })}
                              />
                              <span>Full Day Closure</span>
                            </label>
                          </div>
                        </div>

                        {!formData.isClosedAllDay && (
                          <div className="flex flex-col gap-3 p-3.5 bg-temple-gold/10 dark:bg-gray-700/40 rounded-2xl border border-temple-gold/20">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-xs text-temple-maroon dark:text-temple-gold">
                                Morning Session (Open - Close)
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <TimePickerSelect
                                  value={formData.morningOpen || '04:30 AM'}
                                  onChange={(val) => setFormData({ ...formData, morningOpen: val })}
                                />
                                <span className="font-bold text-gray-400 text-xs">-</span>
                                <TimePickerSelect
                                  value={formData.morningClose || '01:00 PM'}
                                  onChange={(val) => setFormData({ ...formData, morningClose: val })}
                                />
                              </div>
                            </div>

                            <div className="border-t border-temple-gold/20 dark:border-gray-600/50 pt-3 flex flex-col gap-1.5">
                              <span className="font-bold text-xs text-temple-maroon dark:text-temple-gold">
                                Evening Session (Open - Close)
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <TimePickerSelect
                                  value={formData.eveningOpen || '03:30 PM'}
                                  onChange={(val) => setFormData({ ...formData, eveningOpen: val })}
                                />
                                <span className="font-bold text-gray-400 text-xs">-</span>
                                <TimePickerSelect
                                  value={formData.eveningClose || '10:30 PM'}
                                  onChange={(val) => setFormData({ ...formData, eveningClose: val })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Announcement Note / Reason</label>
                          <textarea
                            rows="2"
                            placeholder="Details shown to visiting devotees on live status widgets..."
                            value={formData.reason || ''}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>
                      </>
                    )}

                    {modalType === 'festival' && (
                      <>
                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Festival Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sri Krishna Janmashtami"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Date *</label>
                            <input
                              type="date"
                              required
                              value={formData.date || ''}
                              onChange={e => setFormData({ ...formData, date: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Category *</label>
                            <select
                              value={formData.category || 'Grand Festival'}
                              onChange={e => setFormData({ ...formData, category: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            >
                              <option value="Grand Festival" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Grand Festival</option>
                              <option value="Deity Utsavam" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Deity Utsavam</option>
                              <option value="Major Vratam" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Major Vratam</option>
                              <option value="Light Utsavam" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Light Utsavam</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Morning Special Hours</label>
                            <input
                              type="text"
                              placeholder="e.g. 05:00 AM - 01:00 PM"
                              value={formData.morningTiming || ''}
                              onChange={e => setFormData({ ...formData, morningTiming: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs md:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Evening Special Hours</label>
                            <input
                              type="text"
                              placeholder="e.g. 04:00 PM - 11:30 PM"
                              value={formData.eveningTiming || ''}
                              onChange={e => setFormData({ ...formData, eveningTiming: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs md:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Sacred Details & Description</label>
                          <textarea
                            rows="2"
                            placeholder="Special rituals, Abhishekam timing, cultural programs details..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        {/* Image Upload for Festival Banner */}
                        <div className="flex flex-col gap-2">
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm">Festival Banner Photo</label>
                          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => setImageUploadMode('file')}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${imageUploadMode === 'file'
                                ? 'bg-white dark:bg-gray-800 text-temple-maroon dark:text-temple-gold shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                                }`}
                            >
                              <UploadCloud className="w-4 h-4 text-temple-gold" />
                              <span>Upload From Device</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setImageUploadMode('url')}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${imageUploadMode === 'url'
                                ? 'bg-white dark:bg-gray-800 text-temple-maroon dark:text-temple-gold shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                                }`}
                            >
                              <LinkIcon className="w-4 h-4 text-temple-gold" />
                              <span>Paste Image URL</span>
                            </button>
                          </div>
                        </div>

                        {imageUploadMode === 'file' && (
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor="festival-image-input"
                              className="border-2 border-dashed border-temple-gold/40 hover:border-temple-gold dark:border-gray-600 dark:hover:border-temple-gold rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-temple-cream/30 dark:bg-gray-700/30 hover:bg-temple-cream/60 transition-all group"
                            >
                              <UploadCloud className="w-6 h-6 text-temple-gold mb-1 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-xs text-temple-maroon dark:text-temple-gold">
                                Click to upload festival photo from device
                              </span>
                            </label>
                            <input
                              id="festival-image-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleDeviceFileUpload}
                            />
                          </div>
                        )}

                        {imageUploadMode === 'url' && (
                          <div>
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/photo-..."
                              value={formData.image || ''}
                              onChange={e => setFormData({ ...formData, image: e.target.value, fileName: null })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            />
                          </div>
                        )}

                        {/* Live Photo Preview */}
                        {formData.image && formData.image.trim() !== '' && (
                          <div className="h-28 w-full rounded-2xl overflow-hidden border border-temple-gold/30 relative shadow-sm">
                            <img src={formData.image} alt="Festival Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </>
                    )}


                    {modalType === 'notice' && (
                      <>
                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Notice Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sravana Shukravaram Special Abhishekam"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Category *</label>
                            <select
                              value={formData.category || 'Timings'}
                              onChange={e => setFormData({ ...formData, category: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            >
                              <option value="Timings" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Timings</option>
                              <option value="Poojas" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Poojas</option>
                              <option value="Facilities" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Facilities</option>
                              <option value="Alert" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Alert</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Bulletin Date *</label>
                            <input
                              type="date"
                              required
                              value={formData.date || new Date().toISOString().split('T')[0]}
                              onChange={e => setFormData({ ...formData, date: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Notice Description / Details *</label>
                          <textarea
                            rows="3"
                            required
                            placeholder="Full details of the notice or announcement for visiting devotees..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isUnread"
                            checked={Boolean(formData.isUnread)}
                            onChange={e => setFormData({ ...formData, isUnread: e.target.checked })}
                            className="w-4 h-4 text-temple-gold rounded focus:ring-temple-gold"
                          />
                          <label htmlFor="isUnread" className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">
                            Mark as "NEW" highlight badge for devotees
                          </label>
                        </div>
                      </>
                    )}

                    {modalType === 'gallery' && (
                      <>
                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Photo Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sree Vasavi Devi Golden Alankaram"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Category *</label>
                            <select
                              value={formData.category || 'Temple'}
                              onChange={e => setFormData({ ...formData, category: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            >
                              <option value="Temple" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Temple Architecture</option>
                              <option value="Festivals" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Festivals</option>
                              <option value="Poojas" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Poojas & Rituals</option>
                              <option value="Construction" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Construction</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Card Aspect Ratio</label>
                            <select
                              value={formData.aspect || 'aspect-square'}
                              onChange={e => setFormData({ ...formData, aspect: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            >
                              <option value="aspect-square" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Square (1:1)</option>
                              <option value="aspect-[3/4]" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Tall (3:4)</option>
                              <option value="aspect-[4/3]" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Standard (4:3)</option>
                              <option value="aspect-[16/9]" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold">Wide (16:9)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Devotee Description / Caption</label>
                          <textarea
                            rows="2"
                            placeholder="Description displayed on hover and full-screen lightbox..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs md:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                          />
                        </div>

                        {/* Image Source Mode Selector Tabs */}
                        <div className="flex flex-col gap-2">
                          <label className="block font-semibold">Image Source *</label>
                          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => setImageUploadMode('file')}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${imageUploadMode === 'file'
                                ? 'bg-white dark:bg-gray-800 text-temple-maroon dark:text-temple-gold shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                                }`}
                            >
                              <UploadCloud className="w-4 h-4 text-temple-gold" />
                              <span>Upload From Device</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setImageUploadMode('url')}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${imageUploadMode === 'url'
                                ? 'bg-white dark:bg-gray-800 text-temple-maroon dark:text-temple-gold shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                                }`}
                            >
                              <LinkIcon className="w-4 h-4 text-temple-gold" />
                              <span>Paste Image URL</span>
                            </button>
                          </div>
                        </div>

                        {/* Device File Upload Drop Zone */}
                        {imageUploadMode === 'file' && (
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor="device-image-input"
                              className={`border-2 border-dashed border-temple-gold/40 hover:border-temple-gold dark:border-gray-600 dark:hover:border-temple-gold rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-temple-cream/30 dark:bg-gray-700/30 hover:bg-temple-cream/60 transition-all group ${isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="w-12 h-12 rounded-full bg-temple-gold/10 text-temple-gold flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <UploadCloud className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
                              </div>
                              <span className="font-bold text-xs md:text-sm text-temple-maroon dark:text-temple-gold mb-1">
                                {isUploading ? 'Uploading image to Cloudinary...' : 'Click to upload photo from device / computer'}
                              </span>
                              <span className="text-[11px] text-gray-400 font-serif">
                                Supports JPG, PNG, WEBP, GIF. Auto-resized for fast loading.
                              </span>
                              <input
                                id="device-image-input"
                                type="file"
                                accept="image/*"
                                disabled={isUploading}
                                onChange={handleDeviceFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        {/* Web URL Input Field */}
                        {imageUploadMode === 'url' && (
                          <div>
                            <label className="block text-gray-800 dark:text-white font-bold text-xs md:text-sm mb-1">Image Web URL *</label>
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/photo-..."
                              value={formData.image || ''}
                              onChange={e => setFormData({ ...formData, image: e.target.value, fileName: null })}
                              className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold text-xs placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                            />
                          </div>
                        )}

                        {/* Live Image Preview */}
                        {formData.image && formData.image.trim() !== '' && (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-gray-400">Live Photo Preview:</span>
                              <div className="flex items-center gap-2">
                                {formData.fileName && (
                                  <span className="text-[10px] font-mono text-green-600 dark:text-green-400 font-bold truncate max-w-[180px]">
                                    ✓ Device File: {formData.fileName}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, image: '', fileName: null })}
                                  className="text-[10px] text-red-500 hover:text-red-700 font-bold underline"
                                >
                                  Remove Photo
                                </button>
                              </div>
                            </div>
                            <div className="h-40 w-full rounded-2xl overflow-hidden border border-temple-gold/30 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative shadow-sm flex items-center justify-center">
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.style.display = 'none'
                                  const parent = e.target.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div className="p-4 text-center text-xs text-red-500 font-bold">⚠️ Invalid image URL or format. Please select an image file from your device.</div>'
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Always Visible Sticky Action Footer */}
                  <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-all text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="btn-gold !py-2.5 !px-6 text-xs uppercase font-bold tracking-wider shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Uploading Image...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default Admin
