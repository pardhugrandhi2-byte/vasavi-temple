import React from 'react'
import { motion } from 'framer-motion'
import { Heart, ShieldCheck, Award, Building2, Phone, Sparkles } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import UpiDonationSection from '../components/common/UpiDonationSection'

const Donate = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-temple-cream/30 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
        
        {/* Top Banner Hero */}
        <section className="relative py-16 px-6 bg-gradient-to-b from-temple-maroon to-temple-maroon-dark text-white text-center shadow-lg">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-temple-gold/20 border border-temple-gold/40 px-4 py-1.5 rounded-full mb-3">
              <Sparkles className="w-4 h-4 text-temple-gold animate-pulse" />
              <span className="text-temple-gold font-bold tracking-widest text-xs uppercase font-sans">
                Sacred Giving & Annadanam Seva
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-4">
              Support Sree Vasavi Devasthanam
            </h1>

            <p className="text-sm md:text-lg text-amber-100/90 font-serif max-w-2xl leading-relaxed">
              Your generous contribution fuels daily Nitya Annadanam for thousands of pilgrims, supports sacred Vedic poojas, and helps expand temple infrastructure.
            </p>
          </div>
        </section>

        {/* UPI QR Code & PhonePe Payment Section */}
        <UpiDonationSection title="Instant UPI / PhonePe Scanner & E-Donations" />

        {/* Direct Bank Account Transfer Section */}
        <section className="py-12 px-6 max-w-6xl mx-auto w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-md flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-temple-gold/15 text-temple-gold flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-temple-maroon dark:text-temple-gold">
                  Direct Bank Transfer (NEFT / RTGS / IMPS)
                </h3>
                <p className="text-xs text-gray-500 font-serif">For large contributions, corpus funds, or direct wire transfers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-temple-cream/50 dark:bg-gray-700/40 border border-temple-gold/20 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Account Name</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">Sree Vasavi Devasthanam Trust</span>
              </div>

              <div className="p-4 rounded-2xl bg-temple-cream/50 dark:bg-gray-700/40 border border-temple-gold/20 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Account Number</span>
                <span className="font-bold text-temple-gold text-sm font-mono tracking-wider">3829 0100 0048 291</span>
              </div>

              <div className="p-4 rounded-2xl bg-temple-cream/50 dark:bg-gray-700/40 border border-temple-gold/20 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Bank & Branch</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">State Bank of India, Penugonda</span>
              </div>

              <div className="p-4 rounded-2xl bg-temple-cream/50 dark:bg-gray-700/40 border border-temple-gold/20 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">IFSC Code</span>
                <span className="font-bold text-temple-maroon dark:text-temple-gold text-sm font-mono tracking-wider">SBIN0002781</span>
              </div>
            </div>

            {/* 80G Tax Exemption Note */}
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 flex items-center gap-3 text-xs text-green-800 dark:text-green-300">
              <ShieldCheck className="w-6 h-6 shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <strong className="block font-bold">Tax Exemption under Section 80G available</strong>
                <span>All monetary contributions to Penugonda Vasavi Devasthanam Trust are eligible for tax deduction benefits under Section 80G of the Indian Income Tax Act.</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  )
}

export default Donate
