import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Copy, Check, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useApp, DEFAULT_DONATION_STORE } from '../../context/AppContext'

const UpiDonationSection = ({ title }) => {
  const { donationStore } = useApp()
  const dStore = donationStore || DEFAULT_DONATION_STORE

  const upiId = dStore.upiId || 'vasavitemple@ybl'
  const payeeName = dStore.payeeName || 'Sree Vasavi Kanyaka Parameswari Devasthanam'
  const sectionTitle = title || dStore.title || 'Sacred E-Donations & Seva (UPI / PhonePe)'
  const sectionSubtitle = dStore.subtitle || 'Scan the official temple UPI QR code or copy UPI ID to donate'

  const [copied, setCopied] = useState(false)
  const [useStaticUploadedQr, setUseStaticUploadedQr] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Standard UPI QR string
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&mc=7399&mode=02&orgid=000000&cu=INR`

  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}&color=4A0E17&bgcolor=FFFDF8`

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

  return (
    <section className="py-8 px-4 sm:px-6 max-w-xl mx-auto w-full font-sans">
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

      {/* Main Container Card */}
      <div className="bg-gradient-to-b from-temple-cream/90 via-white to-temple-cream/50 dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900 rounded-3xl border-2 border-temple-gold/30 p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col items-center text-center gap-5">
        
        {/* Header Title */}
        <div className="flex flex-col items-center gap-2 border-b border-temple-gold/20 pb-4 w-full">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-full bg-temple-gold/15 flex items-center justify-center text-temple-gold shrink-0">
              <Heart className="w-4 h-4 fill-temple-gold" />
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold font-display text-temple-maroon dark:text-white">
              {sectionTitle}
            </h2>
          </div>

          <span className="text-xs text-gray-500 font-serif">
            {sectionSubtitle}
          </span>
        </div>

        {/* UPI QR & Copy Box */}
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border-2 border-temple-gold/40 p-5 flex flex-col items-center gap-4 shadow-md relative">
          
          {/* PhonePe Merchant Badge */}
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#5f259f] text-white flex items-center justify-center font-bold text-xs shadow">
                पे
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-white text-left truncate max-w-[200px]">{payeeName}</span>
            </div>

            <span className="bg-green-500/15 text-green-600 dark:text-green-400 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          {/* QR Code Frame */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative p-3 bg-white rounded-2xl border-2 border-temple-gold shadow-md">
              <img
                src={qrCodeUrl}
                alt="Temple UPI QR Code Scanner"
                className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = dynamicQrCodeUrl
                }}
              />

              {/* Center PhonePe Icon Overlay */}
              <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full p-0.5 shadow border border-purple-200 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#5f259f] text-white font-extrabold text-xs flex items-center justify-center">
                  पे
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 mt-1">
              <QrCode className="w-4 h-4 text-temple-gold" />
              <span className="font-bold text-temple-maroon dark:text-temple-gold">
                Scan with any UPI App to Pay
              </span>
              {dStore.customQrUrl && (
                <button
                  type="button"
                  onClick={() => setUseStaticUploadedQr(!useStaticUploadedQr)}
                  className="text-[10px] underline text-purple-700 dark:text-purple-400 font-sans ml-1"
                >
                  {useStaticUploadedQr ? 'Use Dynamic QR' : 'Use Uploaded Photo'}
                </button>
              )}
            </div>
          </div>

          {/* Official UPI ID Copy Bar */}
          <div className="w-full bg-temple-cream/60 dark:bg-gray-700/50 p-3 rounded-xl border border-temple-gold/40 flex items-center justify-between text-xs sm:text-sm gap-2">
            <div className="flex flex-col text-left font-mono truncate">
              <span className="text-[10px] uppercase font-bold text-gray-400">Temple Official UPI ID</span>
              <span className="font-bold text-temple-maroon dark:text-temple-gold text-sm sm:text-base truncate select-all">{upiId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-3.5 py-2 bg-temple-gold hover:bg-temple-gold/90 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs shrink-0 shadow-md active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}

export default UpiDonationSection
