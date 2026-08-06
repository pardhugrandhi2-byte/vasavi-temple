import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Copy, Check, Heart, ExternalLink, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react'
import { useApp, DEFAULT_DONATION_STORE } from '../../context/AppContext'

const UpiDonationSection = ({ title }) => {
  const { donationStore } = useApp()
  const dStore = donationStore || DEFAULT_DONATION_STORE

  const upiId = dStore.upiId || 'vasavitemple@ybl'
  const payeeName = dStore.payeeName || 'Sree Vasavi Kanyaka Parameswari Devasthanam'
  const sectionTitle = title || dStore.title || 'Sacred E-Donations & Seva (UPI / PhonePe)'
  const sectionSubtitle = dStore.subtitle || 'Scan the official temple UPI QR code or tap PhonePe to donate directly'
  const presetAmounts = dStore.presetAmounts && dStore.presetAmounts.length > 0 
    ? dStore.presetAmounts 
    : [101, 501, 1008, 2116, 5001, 10008]

  const [customAmount, setCustomAmount] = useState(() => String(presetAmounts[0] || 101))
  const [devoteeName, setDevoteeName] = useState('')
  const [devoteeGotram, setDevoteeGotram] = useState('')
  const [copied, setCopied] = useState(false)
  const [useStaticUploadedQr, setUseStaticUploadedQr] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : (presetAmounts[0] || 101)

  // Construct parameters with strict NPCI UPI POS specs (mc=7399 for Religious Orgs, mode=02 for POS/Trust QR)
  const noteParts = []
  if (devoteeName && devoteeName.trim()) noteParts.push(devoteeName.trim())
  if (devoteeGotram && devoteeGotram.trim()) noteParts.push(`(${devoteeGotram.trim()})`)
  const noteText = noteParts.join(' ')
  const noteParam = noteText ? `&tn=${encodeURIComponent(noteText)}` : ''
  
  // QR Code UPI string — includes mc=7399 & mode=02 & am= so scanner pre-fills amount seamlessly
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&mc=7399&mode=02&orgid=000000&am=${activeAmount}&cu=INR${noteParam}`

  // Deep Link UPI string — includes mc=7399 & mode=02 for POS/Trust VPAs
  const phonepeDirectUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&mc=7399&mode=02&orgid=000000&cu=INR${noteParam}`

  // Always generate dynamic QR code with embedded activeAmount (&am=101) so phone scanners pre-fill ₹101 automatically!
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}&color=4A0E17&bgcolor=FFFDF8`

  // QR Code to render
  const qrCodeUrl = (useStaticUploadedQr && dStore.customQrUrl && dStore.customQrUrl.trim() !== '')
    ? dStore.customQrUrl
    : dynamicQrCodeUrl

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    showToast(`UPI ID "${upiId}" copied!`)
    setTimeout(() => setCopied(false), 2500)
  }

  // Direct PhonePe Launch Handler
  // Uses standard upi:// scheme — the mobile OS will open PhonePe (or show app chooser)
  // Avoids intent:// which PhonePe blocks as a security measure when launched from browser
  const handlePhonePeClick = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(upiId).catch(() => {})
    setCopied(true)
    showToast(`Launching UPI payment for ₹${activeAmount}...`)
    // Standard upi:// is the safest cross-platform approach
    window.location.href = phonepeDirectUrl
  }

  const handleGenericPay = (appName, targetUrl) => {
    navigator.clipboard.writeText(upiId).catch(() => {})
    showToast(`Opening ${appName}...`)
    window.location.href = targetUrl
  }

  return (
    <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-temple-gold text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Single Non-Scrollable Card Container */}
      <div className="bg-gradient-to-b from-temple-cream/90 via-white to-temple-cream/50 dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900 rounded-3xl border-2 border-temple-gold/30 p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
        
        {/* Header Title (Compact) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-temple-gold/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-temple-gold/15 flex items-center justify-center text-temple-gold shrink-0">
              <Heart className="w-4 h-4 fill-temple-gold" />
            </div>
            <h2 className="text-lg md:text-xl font-extrabold font-display text-temple-maroon dark:text-white">
              {sectionTitle}
            </h2>
          </div>

          <span className="text-[11px] text-gray-500 font-serif">
            {sectionSubtitle}
          </span>
        </div>

        {/* 2-Column Side-by-Side Layout (Zero Scroll) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT COLUMN: Amount Selection & Devotee Details */}
          <div className="md:col-span-7 flex flex-col justify-between gap-4 bg-white dark:bg-gray-800/90 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            
            {/* Amount Presets & Custom Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-temple-gold">
                Select Donation Amount (₹)
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(String(amt))}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                      parseFloat(customAmount) === amt
                        ? 'bg-temple-gold text-white border-temple-gold shadow-sm scale-[1.02]'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-temple-gold/50'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="relative mt-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-temple-gold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-base font-mono font-extrabold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-temple-gold shadow-sm"
                />
              </div>
            </div>

            {/* Devotee Sankalpam Info (Compact) */}
            <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-700 pt-3 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-temple-gold text-[11px]">
                Devotee Sankalpam Details (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-0.5">Devotee Name</label>
                  <input
                    type="text"
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    placeholder="e.g. Rama Rao & Family"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-0.5">Gotram</label>
                  <input
                    type="text"
                    value={devoteeGotram}
                    onChange={(e) => setDevoteeGotram(e.target.value)}
                    placeholder="e.g. Penugonda Gotram"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-temple-gold"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Compact QR & PhonePe Payment Box */}
          <div className="md:col-span-5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-temple-gold/40 p-4 flex flex-col items-center justify-between text-center gap-3 shadow-md relative">
            
            {/* PhonePe Merchant Badge */}
            <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-[#5f259f] text-white flex items-center justify-center font-bold text-[10px] shadow">
                  पे
                </div>
                <span className="font-bold text-xs text-gray-800 dark:text-white truncate max-w-[150px]">{payeeName}</span>
              </div>

              <span className="bg-green-500/15 text-green-600 dark:text-green-400 font-bold text-[9px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>

            {/* Compact QR Code Frame */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative p-2 bg-white rounded-2xl border-2 border-temple-gold shadow-md">
                <img
                  src={qrCodeUrl}
                  alt="Temple UPI QR Code Scanner"
                  className="w-36 h-36 md:w-40 md:h-40 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = dynamicQrCodeUrl
                  }}
                />

                {/* Center PhonePe Icon Overlay */}
                <div className="absolute inset-0 m-auto w-8 h-8 bg-white rounded-full p-0.5 shadow border border-purple-200 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#5f259f] text-white font-extrabold text-[10px] flex items-center justify-center">
                    पे
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 mt-0.5">
                <QrCode className="w-3 h-3 text-temple-gold" />
                <span className="font-bold text-temple-maroon dark:text-temple-gold">
                  Pre-filled ₹{activeAmount} QR Code
                </span>
                {dStore.customQrUrl && (
                  <button
                    type="button"
                    onClick={() => setUseStaticUploadedQr(!useStaticUploadedQr)}
                    className="text-[9px] underline text-purple-700 dark:text-purple-400 font-sans ml-1"
                  >
                    {useStaticUploadedQr ? 'Use Dynamic QR' : 'Use Uploaded Photo'}
                  </button>
                )}
              </div>
            </div>

            {/* Official UPI ID Bar */}
            <div className="w-full bg-temple-cream/60 dark:bg-gray-700/50 p-2 rounded-xl border border-temple-gold/30 flex items-center justify-between text-xs gap-1">
              <div className="flex flex-col text-left font-mono truncate">
                <span className="text-[9px] uppercase font-bold text-gray-400">UPI ID</span>
                <span className="font-bold text-temple-maroon dark:text-temple-gold text-xs truncate">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1 bg-white dark:bg-gray-800 text-temple-maroon dark:text-temple-gold border border-temple-gold/40 hover:bg-temple-gold hover:text-white rounded-lg font-bold transition-all flex items-center gap-1 text-[11px] shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct Action Button: DONATE VIA PHONEPE */}
            <div className="w-full flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handlePhonePeClick}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5f259f] hover:bg-[#4a1d7c] text-white font-extrabold text-xs md:text-sm uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-white text-[#5f259f] flex items-center justify-center font-black text-[10px]">
                  पे
                </div>
                <span>OPEN UPI APP — ENTER ₹{activeAmount}</span>
                <ExternalLink className="w-3.5 h-3.5 text-purple-200" />
              </button>


              {/* Secondary Apps */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold mt-1">
                <a
                  href={`gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&mc=7399&mode=02&orgid=000000&am=${activeAmount}&cu=INR${noteParam}`}
                  onClick={(e) => handleGenericPay('Google Pay', e.currentTarget.href)}
                  className="py-1.5 px-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:border-blue-500 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span className="text-blue-600 font-bold">G</span>Pay
                </a>

                <a
                  href={`paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&mc=7399&mode=02&orgid=000000&am=${activeAmount}&cu=INR${noteParam}`}
                  onClick={(e) => handleGenericPay('Paytm', e.currentTarget.href)}
                  className="py-1.5 px-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:border-cyan-500 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span className="text-cyan-600 font-bold">Paytm</span>
                </a>

                <a
                  href={upiString}
                  onClick={(e) => handleGenericPay('BHIM UPI', e.currentTarget.href)}
                  className="py-1.5 px-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:border-orange-500 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span className="text-orange-600 font-bold">BHIM</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default UpiDonationSection
