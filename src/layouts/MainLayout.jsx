import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import ScrollToTop from '../components/common/ScrollToTop'
import BackToTopButton from '../components/common/BackToTopButton'

const MainLayout = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col bg-temple-cream text-temple-charcoal overflow-x-hidden selection:bg-temple-gold selection:text-white">
      {/* Reset scroll on route changes */}
      <ScrollToTop />
      
      {/* Premium Sticky Navigation Bar (Hidden on dedicated Admin Portal) */}
      {!isAdmin && <Header />}
      
      {/* Main page content area */}
      <main className="flex-grow flex flex-col relative w-full">
        <Outlet />
      </main>
      
      {/* Floating Back to Top Button */}
      {!isAdmin && <BackToTopButton />}

      {/* Footer Component (Hidden on dedicated Admin Portal) */}
      {!isAdmin && <Footer />}
    </div>
  )
}

export default MainLayout
// 
