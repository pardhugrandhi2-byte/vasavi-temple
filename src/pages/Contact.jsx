import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Check, Globe, Share2, Navigation, Compass } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useApp } from '../context/AppContext'
import { cleanAndConvertMapsUrl, getMapsShareUrl } from '../utils/mapsHelper'

const Contact = () => {
  const { contactStore } = useApp()

  const embedMapUrl = cleanAndConvertMapsUrl(contactStore?.googleMapsUrl, contactStore?.address)
  const shareMapUrl = contactStore?.googleMapsShareUrl || getMapsShareUrl(contactStore?.googleMapsUrl, contactStore?.address)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  })

  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormStatus({ submitting: true, submitted: false, message: '' })

    // Simulate API request delay
    setTimeout(() => {
      setFormStatus({
        submitting: false,
        submitted: true,
        message: 'Thank you! Your message has been received. Our temple office will reach out to you shortly.'
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      })
    }, 1000)
  }

  return (
    <PageTransition>
      <div className="py-12 md:py-20 px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-temple-gold font-semibold tracking-widest text-xs md:text-sm uppercase mb-2 block">
            Devotee Support
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-temple-charcoal mb-4 font-display">
            Contact & Visit Sree Vasavi Temple
          </h1>
          <p className="text-sm md:text-base text-temple-charcoal-light font-serif">
            We welcome all devotees, pilgrims, and visitors. Reach out to our administrative office for puja bookings, accommodation assistance, or travel inquiries.
          </p>
        </div>

        {/* Top 3 Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Phone & WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-temple-gold/20 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-temple-gold/10 text-temple-gold flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-temple-maroon mb-1">
                Phone & WhatsApp
              </h3>
              <p className="text-xs text-temple-charcoal-light font-serif mb-3">
                Direct helpline for darshan timings & pooja inquiries.
              </p>
              <div className="flex flex-col gap-1 text-sm font-mono text-temple-charcoal font-semibold">
                <a href={`tel:${(contactStore?.phone || '+91 88888 99999').replace(/\s+/g, '')}`} className="hover:text-temple-gold transition-colors flex items-center gap-2">
                  <span>{contactStore?.phone || '+91 88888 99999'}</span>
                </a>
                <a href={`https://wa.me/${(contactStore?.whatsapp || '+91 99999 88888').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors flex items-center gap-2 text-green-700">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp: {contactStore?.whatsapp || '+91 99999 88888'}</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Email & Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-temple-gold/20 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-temple-maroon/10 text-temple-maroon flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-temple-maroon mb-1">
                Email & Working Hours
              </h3>
              <p className="text-xs text-temple-charcoal-light font-serif mb-3">
                Send official letters, donations, or trust queries.
              </p>
              <div className="flex flex-col gap-1.5 text-xs text-temple-charcoal">
                <a href={`mailto:${contactStore?.email || 'contact@vasavitemple.org'}`} className="hover:text-temple-gold font-mono font-semibold">
                  {contactStore?.email || 'contact@vasavitemple.org'}
                </a>
                <div className="flex items-center gap-1.5 text-[11px] text-temple-charcoal-light border-t border-gray-100 pt-1.5">
                  <Clock className="w-3.5 h-3.5 text-temple-gold shrink-0" />
                  <span>{contactStore?.workingHours || '6:00 AM - 12:30 PM | 4:00 PM - 8:30 PM'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Address & Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-temple-gold/20 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-temple-gold/10 text-temple-gold flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-temple-maroon mb-1">
                Temple Address
              </h3>
              <p className="text-xs text-temple-charcoal-light font-serif leading-relaxed">
                {contactStore?.address || 'Main Bazar Road, Sree Vasavi Sanctum Complex, Penugonda / Sacred Spiritual Center, Andhra Pradesh, India.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Section: 2-Column Grid (Quick Contact Form + Interactive Map & Social Links) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column (Lg: 7 cols): Quick Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-10 border border-temple-gold/20 shadow-lg relative">
            <div className="mb-6">
              <span className="text-temple-gold font-semibold tracking-wider text-xs uppercase block mb-1">
                Send Us a Message
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-temple-charcoal font-display">
                Quick Devotee Inquiry Form
              </h2>
            </div>

            {/* Submission Alert Status */}
            {formStatus.submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs md:text-sm flex items-center gap-3"
              >
                <Check className="w-5 h-5 bg-green-600 text-white rounded-full p-0.5 shrink-0" />
                <span>{formStatus.message}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs md:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-temple-charcoal">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ramesh Kumar"
                    className="border border-temple-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-gold bg-temple-cream/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-temple-charcoal">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="border border-temple-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-gold bg-temple-cream/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-temple-charcoal">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ramesh@example.com"
                    className="border border-temple-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-gold bg-temple-cream/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-temple-charcoal">Subject / Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="border border-temple-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-gold bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Pooja Booking">Pooja & Seva Booking</option>
                    <option value="Donation Assistance">Donations & Trust</option>
                    <option value="Accommodation">Accommodation & Visit</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-temple-charcoal">Your Message *</label>
                <textarea
                  rows="5"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="How can our temple office assist you?"
                  className="border border-temple-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-gold bg-temple-cream/20"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formStatus.submitting}
                className="btn-gold !py-3.5 !px-8 text-sm uppercase tracking-wider font-semibold shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {formStatus.submitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column (Lg: 5 cols): Google Maps Placeholder & Social Channels */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Google Map Card Placeholder */}
            <div className="bg-white rounded-3xl overflow-hidden border border-temple-gold/20 shadow-md flex flex-col">
              <div className="p-4 bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-temple-gold" />
                  <span className="font-display font-bold text-sm">Temple Map Location</span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-white/10 px-2 py-0.5 rounded text-temple-gold">
                  GPS Verified
                </span>
              </div>

              {/* Styled Google Maps iframe Container */}
              <div className="w-full h-64 bg-temple-cream-dark relative overflow-hidden">
                <iframe
                  title="Sree Vasavi Temple Location"
                  src={embedMapUrl}
                  className="w-full h-full border-0 filter contrast-105"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="p-4 bg-white flex items-center justify-between text-xs border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-temple-charcoal-light">
                  <Compass className="w-4 h-4 text-temple-gold" />
                  <span>Sacred Sanctum Precincts</span>
                </div>

                <a
                  href={shareMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-temple-maroon font-bold hover:text-temple-gold transition-colors flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <Share2 className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Travel Guide Summary */}
            <div className="bg-temple-cream/60 rounded-2xl p-6 border border-temple-gold/20 flex flex-col gap-3">
              <h3 className="font-display font-bold text-base text-temple-maroon">
                How to Reach the Temple
              </h3>
              <ul className="flex flex-col gap-2 text-xs text-temple-charcoal-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-temple-gold shrink-0">❖ By Train:</span>
                  <span>Nearest major railway junctions are Tanuku / Nidadavole (20 km away).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-temple-gold shrink-0">❖ By Road:</span>
                  <span>Frequent RTC & private buses operate directly to Penugonda bus stand.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-temple-gold shrink-0">❖ By Air:</span>
                  <span>Rajahmundry Airport (RJA) is approximately 65 km away.</span>
                </li>
              </ul>
            </div>

            {/* Social Media Channels */}
            <div className="bg-white rounded-2xl p-6 border border-temple-gold/20 shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-base text-temple-charcoal flex items-center gap-2">
                <Globe className="w-4 h-4 text-temple-gold" />
                <span>Connect on Social Media</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <a
                  href={contactStore?.youtubeUrl || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>Live Youtube Pujas</span>
                </a>

                <a
                  href={contactStore?.facebookUrl || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <span>Facebook Page</span>
                </a>

                <a
                  href={contactStore?.instagramUrl || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors border border-pink-200"
                >
                  <span>Instagram Updates</span>
                </a>

                <a
                  href={contactStore?.whatsappChannelUrl || `https://wa.me/${(contactStore?.whatsapp || '919999988888').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                >
                  <span>WhatsApp Channel</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Contact
