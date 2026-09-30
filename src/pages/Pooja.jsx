import React from 'react'
import PageTransition from '../components/common/PageTransition'

const Pooja = () => {
  return (
    <PageTransition>
      <div className="py-20 px-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center flex-grow">
        <span className="text-temple-gold font-semibold tracking-widest text-sm uppercase mb-2">Sacred Services</span>
        <h1 className="text-4xl font-extrabold text-temple-charcoal mb-6 border-spiritual">
          Pooja & Seva Schedule
        </h1>
        <p className="text-lg text-temple-charcoal-light mb-8 font-serif leading-relaxed mt-6">
          Explore list of daily, weekly, and special poojas including Abhishekam, Archana, and Kumkumarchana, along with online slot bookings.
        </p>
      </div>
    </PageTransition>
  )
}

export default Pooja
