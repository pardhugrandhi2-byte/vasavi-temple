import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Timings from './pages/Timings'
import Festivals from './pages/Festivals'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Donate from './pages/Donate'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="timings" element={<Timings />} />
            <Route path="festivals" element={<Festivals />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="donate" element={<Donate />} />
            <Route path="admin" element={<Admin />} />
            {/* Fallback 404 Page Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
