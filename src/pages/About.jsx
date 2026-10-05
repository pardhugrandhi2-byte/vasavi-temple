import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShieldCheck, Utensils, Calendar, Clock, MapPin, Sparkles, BookOpen, ArrowRight } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useApp, DEFAULT_ABOUT_DETAILS } from '../context/AppContext'

const About = () => {
  const { aboutStore } = useApp()
  const about = aboutStore || DEFAULT_ABOUT_DETAILS

  const valueIcons = [Heart, ShieldCheck, Utensils]

  return (
    <PageTransition>
      <div className="min-h-screen bg-temple-cream/30 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
        
        {/* Hero Banner Section */}
        <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-b from-temple-maroon/90 via-temple-maroon to-temple-maroon-dark text-white text-center shadow-xl">
          {/* Subtle overlay texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-temple-gold/20 via-transparent to-transparent opacity-60 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-temple-gold/20 border border-temple-gold/40 px-4 py-1.5 rounded-full mb-4 shadow-inner"
            >
              <Sparkles className="w-4 h-4 text-temple-gold animate-pulse" />
              <span className="text-temple-gold font-semibold tracking-widest text-xs uppercase font-sans">
                {about.subTitle || 'Sacred History & Heritage'}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-6 leading-tight drop-shadow-md"
            >
              {about.title || 'Sree Vasavi Kanyaka Parameswari Devi'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-xl text-amber-100/90 font-serif max-w-2xl leading-relaxed mb-8"
            >
              {about.introText || 'Discover the divine story of Goddess Vasavi Devi, the sacred birthplace of Penugonda kshetram, and the timeless message of Ahimsa and Dharmic devotion.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/timings" className="btn-gold shadow-lg flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>View Darshan Timings</span>
              </Link>
              <Link to="/contact" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs md:text-sm tracking-wider uppercase backdrop-blur-md transition-all flex items-center gap-2">
                <MapPin className="w-4 h-4 text-temple-gold" />
                <span>Visit Temple</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Image & Sacred Legend Section */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Feature Banner Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 group">
                <img
                  src={about.heroImage || 'https://images.unsplash.com/photo-1608958416713-ef377227443e?auto=format&fit=crop&w=1200&q=80'}
                  alt={about.title}
                  className="w-full h-[380px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                />

              </div>


            </motion.div>

            {/* Sacred Story Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 flex flex-col justify-center gap-6"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-temple-gold" />
                <span className="text-temple-maroon dark:text-temple-gold font-bold text-xs uppercase tracking-widest">
                  Sacred Chronicle
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold font-display text-temple-maroon dark:text-white leading-tight">
                {about.storyTitle || 'The Sacred Legend of Penugonda Kshetram'}
              </h2>

              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 font-serif leading-relaxed">
                {about.storyContent || 'Sree Vasavi Kanyaka Parameswari Devi is revered as an embodiment of Goddess Parvati. Born to King Kusuma Shresthi and Kousalyamamba in Penugonda, she exemplified supreme wisdom, compassion, and divine purity from early childhood. To prevent bloodshed and uphold non-violence (Ahimsa), Goddess Vasavi entered the sacred fire (Agni Pravesam) along with 102 Gotra couples. Her eternal sacrifice sanctified Penugonda as the divine Moolakshetram, inspiring millions worldwide.'}
              </p>

              {/* Quote Highlight Box */}
              <div className="p-5 rounded-2xl bg-temple-cream dark:bg-gray-800 border-l-4 border-temple-gold shadow-sm font-serif italic text-gray-700 dark:text-gray-200 text-sm md:text-base">
                "Ahimsa (non-violence) and Atma-Tyaga (selfless devotion) are the ultimate lights that illuminate the path of righteousness for future generations."
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Pillars / Values Grid Section */}
        {about.values && about.values.length > 0 && (
          <section className="py-16 px-6 bg-white dark:bg-gray-800/60 border-y border-gray-200/60 dark:border-gray-800">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-temple-gold font-bold text-xs uppercase tracking-widest mb-2 block">
                  Guiding Principles
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold font-display text-gray-900 dark:text-white">
                  Core Spiritual Values of Our Devastanam
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {about.values.map((val, idx) => {
                  const IconComp = valueIcons[idx % valueIcons.length]
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="p-8 rounded-3xl bg-temple-cream/40 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-temple-gold dark:hover:border-temple-gold transition-all duration-300 shadow-sm hover:shadow-md flex flex-col gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-temple-gold/15 text-temple-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComp className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-temple-maroon dark:text-temple-gold">
                        {val.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-serif leading-relaxed">
                        {val.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Historical Timeline Section */}
        {about.timeline && about.timeline.length > 0 && (
          <section className="py-16 px-6 max-w-5xl mx-auto w-full">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-temple-gold font-bold text-xs uppercase tracking-widest mb-2 block">
                Chronology of Devotion
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-gray-900 dark:text-white">
                Historical Milestones & Legacy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {about.timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-temple-gold/10 rounded-bl-full pointer-events-none" />
                  
                  <div>
                    <span className="inline-block px-3 py-1 bg-temple-gold/20 text-temple-gold text-xs font-mono font-extrabold rounded-full mb-3">
                      {item.year}
                    </span>
                    <h4 className="text-lg font-bold font-display text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-serif leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-temple-gold uppercase tracking-wider pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Historical Record</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Temple Leadership / Trust Card */}
        <section className="py-12 px-6 max-w-4xl mx-auto w-full mb-12">
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-temple-maroon to-temple-maroon-dark text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-temple-gold/30 relative overflow-hidden">
            <div className="flex flex-col gap-2 max-w-xl text-center md:text-left">
              <span className="text-xs uppercase font-bold tracking-widest text-temple-gold">Governance & Trust</span>
              <h3 className="text-2xl font-extrabold font-display">
                {about.managementTitle || 'Penugonda Vasavi Devasthanam Trust'}
              </h3>
              <p className="text-sm font-serif text-amber-100/90 leading-relaxed">
                {about.managementDescription || 'The temple is managed with complete devotion, transparency, and service by the governing trust committee dedicated to preserving sacred traditions and serving devotees.'}
              </p>
            </div>

            <Link
              to="/contact"
              className="btn-gold shadow-lg !py-3 !px-6 text-xs uppercase font-bold tracking-wider shrink-0 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span>Contact Trustees</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </PageTransition>
  )
}

export default About
