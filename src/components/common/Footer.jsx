import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { VASAVI_DEVI_PHOTO } from '../../assets/vasavi_devi'

const Footer = () => {
  const { visitorCount, contactStore } = useApp()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-temple-maroon to-temple-maroon-dark text-white border-t-4 border-temple-gold relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none bg-[radial-gradient(#C67C00_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                <img 
                  src={VASAVI_DEVI_PHOTO} 
                  alt="Sree Vasavi Kanyaka Parameswari Devi" 
                  className="w-full h-full object-cover object-top scale-[1.15]"
                />
              </div>
              <span className="font-display font-bold text-lg text-temple-gold tracking-wider">
                SREE VASAVI TEMPLE
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-serif">
              Dedicated to preserving our Vedic heritage and spiritual practices. Experience the divine blessings of Sree Vasavi Kanyaka Parameswari Devi.
            </p>
            {/* Live Counters */}
            <div className="mt-4 p-3 bg-black/15 border border-white/10 rounded-lg max-w-xs">
              <span className="text-xs text-temple-gold font-sans uppercase font-bold tracking-wider block">Live Spiritual Footprint</span>
              <span className="text-xl font-bold tracking-widest text-white mt-1 block">
                {new Intl.NumberFormat('en-IN').format(visitorCount)} <span className="text-xs font-normal text-white/60">sacred visits</span>
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-temple-gold tracking-wide relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-temple-gold">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-2.5 text-sm text-white/85">
              <li>
                <Link to="/" className="hover:text-temple-gold transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-temple-gold transition-colors duration-200">About Devi</Link>
              </li>
              <li>
                <Link to="/timings" className="hover:text-temple-gold transition-colors duration-200">Timings</Link>
              </li>
              <li>
                <Link to="/festivals" className="hover:text-temple-gold transition-colors duration-200">Festivals</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-temple-gold transition-colors duration-200">Gallery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-temple-gold transition-colors duration-200">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Timings Summary Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-temple-gold tracking-wide relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-temple-gold">
              Daily Hours
            </h3>
            <div className="flex flex-col gap-3 text-sm text-white/85">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span>Morning Darshan:</span>
                <span className="font-medium text-temple-gold">6:00 AM - 12:30 PM</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span>Evening Darshan:</span>
                <span className="font-medium text-temple-gold">4:00 PM - 8:30 PM</span>
              </div>
              <p className="text-xs text-white/60 italic leading-relaxed">
                * Note: Timings may vary on major festival days (e.g. Navarathri). Please check the festivals calendar.
              </p>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-temple-gold tracking-wide relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-temple-gold">
              Contact Center
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-white/85">
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-temple-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-serif">{contactStore?.address || 'Main Bazar Road, Spiritual Center, Andhra Pradesh, India.'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-temple-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contactStore?.phone || '+91 88888 99999'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-temple-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{contactStore?.email || 'contact@vasavitemple.org'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© {currentYear} Sree Vasavi Kanyaka Parameswari Temple. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <a href="#" className="hover:text-temple-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-temple-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-temple-gold transition-colors">Refund Policy</a>
            <Link to="/admin" className="text-temple-gold/70 hover:text-temple-gold font-medium flex items-center gap-1 transition-colors group">
              <svg className="w-3.5 h-3.5 text-temple-gold group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
