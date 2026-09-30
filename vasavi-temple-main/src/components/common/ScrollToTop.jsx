import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' // Instant is preferred to avoid jarring scrolls during smooth page transition fade-outs
    })
  }, [pathname])

  return null
}

export default ScrollToTop
