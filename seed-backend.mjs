// seed-backend.mjs
// Run: node seed-backend.mjs
// Pushes all default temple data to the Render backend so the website works correctly.

const API_BASE = 'https://vasavi-temple-kadiyapulanka.onrender.com/api'

const DEFAULT_DATA = {
  vasavi_temple_contact: {
    phone: '+91 88888 99999',
    whatsapp: '+91 99999 88888',
    email: 'contact@vasavitemple.org',
    workingHours: '6:00 AM - 12:30 PM | 4:00 PM - 8:30 PM',
    address: 'Main Bazar Road, Sree Vasavi Sanctum Complex, Penugonda, Andhra Pradesh, India.',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15291.688320498188!2d81.590124!3d16.634125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3628e4e94b5b7b%3A0x6b4a243e88888888!2sPenugonda%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    youtubeUrl: 'https://youtube.com',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    whatsappChannelUrl: 'https://whatsapp.com'
  },

  vasavi_temple_about: {
    subTitle: 'Sacred History & Heritage',
    title: 'Sree Vasavi Kanyaka Parameswari Devi',
    heroImage: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80',
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
  },

  vasavi_temple_donation: {
    title: 'Sacred E-Donations & Seva (UPI / PhonePe)',
    subtitle: 'Scan the official temple UPI QR code or tap PhonePe to donate directly',
    upiId: 'vasavitemple@ybl',
    payeeName: 'Sree Vasavi Kanyaka Parameswari Devasthanam',
    presetAmounts: [101, 501, 1008, 2116, 5001, 10008],
    customQrUrl: '',
    accountName: 'Sree Vasavi Devasthanam Trust',
    accountNumber: '3829 0100 0048 291',
    bankName: 'State Bank of India, Penugonda',
    ifscCode: 'SBIN0002781',
    taxExemptionNote: 'All monetary contributions to Penugonda Vasavi Devasthanam Trust are eligible for tax deduction benefits under Section 80G of the Indian Income Tax Act.'
  },

  vasavi_temple_gallery: [
    { id: 'g1', title: 'Majestic Main Gopuram', category: 'Temple', description: 'Golden hour perspective of our traditional South Indian gopuram with intricate sacred carvings.', image: 'https://images.unsplash.com/photo-1608958416713-ef377227443e?auto=format&fit=crop&w=1200&q=80', aspect: 'aspect-square' },
    { id: 'g2', title: 'Sree Vasavi Devi Alankaram', category: 'Poojas', description: 'Special silk and gold ornament decoration during Friday morning Archana rituals.', image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80', aspect: 'aspect-[3/4]' },
    { id: 'g3', title: 'Navarathri Deepotsavam', category: 'Festivals', description: 'Thousands of glowing oil lamps illuminating the temple courtyard on Vijayadasami.', image: 'https://images.unsplash.com/photo-1602613977505-11996517af5e?auto=format&fit=crop&w=1200&q=80', aspect: 'aspect-[4/3]' },
    { id: 'g4', title: 'New Annadanam Hall Progress', category: 'Construction', description: 'Ongoing development of our multi-purpose dining hall to serve free meals to 5,000 pilgrims daily.', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186244f?auto=format&fit=crop&w=1200&q=80', aspect: 'aspect-[16/9]' },
    { id: 'g5', title: 'Inner Sanctum Sanctity', category: 'Temple', description: 'Serene atmosphere of the inner shrine before morning Suprabhatam prayers.', image: 'https://images.unsplash.com/photo-1609137144813-7d722d56a2cb?auto=format&fit=crop&w=1200&q=80', aspect: 'aspect-square' },
    { id: 'g6', title: 'Special Kumkum Archana Seva', category: 'Poojas', description: 'Devotees offering sacred vermilion powders during the annual Varalakshmi Vratam.', image: 'https://images.unsplash.com/photo-1609137144675-9b2f2b3806eb?auto=format&fit=crop&w=1200&q=80', aspect: 'aspect-[4/3]' }
  ]
}

async function pushToBackend() {
  console.log('🛕  Sree Vasavi Temple — Backend Seeder')
  console.log('=========================================')
  console.log(`📡 Target: ${API_BASE}\n`)

  // Health check first
  try {
    const health = await fetch(`${API_BASE}/health`)
    const healthData = await health.json()
    console.log(`✅ Backend health: ${healthData.status} (${healthData.timestamp})\n`)
  } catch (e) {
    console.error('❌ Backend unreachable:', e.message)
    process.exit(1)
  }

  // Check current data
  const existing = await fetch(`${API_BASE}/data`).then(r => r.json())
  console.log('📦 Current backend keys:', Object.keys(existing.data || {}).join(', ') || '(empty)')
  console.log()

  // Push each key individually
  let successCount = 0
  for (const [key, value] of Object.entries(DEFAULT_DATA)) {
    try {
      const res = await fetch(`${API_BASE}/data/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      })
      const result = await res.json()
      if (result.success) {
        console.log(`  ✅ ${key} → saved`)
        successCount++
      } else {
        console.log(`  ❌ ${key} → failed:`, result.message)
      }
    } catch (e) {
      console.log(`  ❌ ${key} → error:`, e.message)
    }
  }

  console.log(`\n🎯 Done! ${successCount}/${Object.keys(DEFAULT_DATA).length} keys pushed to backend.`)

  // Verify final state
  const final = await fetch(`${API_BASE}/data`).then(r => r.json())
  console.log('\n📋 Final backend keys:', Object.keys(final.data || {}).join(', '))
  
  // Spot-check contact
  const contact = final.data?.vasavi_temple_contact
  if (contact) {
    console.log('\n📞 Contact Details on Backend:')
    console.log(`   Phone: ${contact.phone}`)
    console.log(`   Email: ${contact.email}`)
    console.log(`   Hours: ${contact.workingHours}`)
    console.log(`   Address: ${contact.address}`)
  }

  console.log('\n✅ Backend is ready. The website will now load live data from Render!')
}

pushToBackend()
