import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home as HomeIcon, ArrowLeft, Compass, Clock, Calendar } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'

const NotFound = () => {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 md:p-14 border border-temple-gold/20 shadow-xl flex flex-col items-center gap-6 relative overflow-hidden">
          {/* Subtle gold glow accent */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-temple-gold/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-3xl bg-temple-gold/10 text-temple-gold flex items-center justify-center shadow-inner"
          >
            <Compass className="w-10 h-10" />
          </motion.div>

          <span className="text-xs uppercase tracking-[0.3em] text-temple-gold font-bold font-mono">
            404 - Page Not Found
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold text-temple-charcoal font-display">
            Path Not Found
          </h1>

          <p className="text-sm md:text-base text-temple-charcoal-light font-serif max-w-lg leading-relaxed">
            The sacred path or page you are searching for might have moved, been renamed, or is temporarily unavailable.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link
              to="/"
              className="btn-gold !py-3.5 !px-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Return to Sacred Gateway</span>
            </Link>

            <Link
              to="/timings"
              className="px-8 py-3.5 border-2 border-temple-gold/40 text-temple-maroon hover:bg-temple-gold/10 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>View Timings</span>
            </Link>
          </div>

          {/* Quick links footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 w-full flex justify-center gap-6 text-xs font-semibold text-temple-charcoal-light">
            <Link to="/festivals" className="hover:text-temple-gold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-temple-gold" />
              <span>Festivals</span>
            </Link>
            <Link to="/contact" className="hover:text-temple-gold">
              Contact Helpline
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default NotFound
