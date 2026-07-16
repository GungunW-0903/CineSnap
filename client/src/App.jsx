import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Home from './pages/Home'
import Movies from './pages/Movies'
import NewReleases from './pages/NewReleases'
import ComingSoon from './pages/ComingSoon'
import CineLounges from './pages/CineLounges'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import Checkout from './pages/Checkout'
import BookingSuccess from './pages/BookingSuccess'
import BookingCancelled from './pages/BookingCancelled'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBooking from './pages/admin/ListBooking'
import AdminScan from './pages/admin/AdminScan'
import SmoothScroll from './components/ui/SmoothScroll'
import Rewards from './pages/Rewards'
import Verify from './pages/Verify'
import { ProfileProvider } from './context/ProfileContext'

// Cinematic page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.45, ease: [0.22, 0.97, 0.41, 1] }}
  >
    {children}
  </motion.div>
)

// Thin gradient progress bar reflecting scroll depth
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })
  return <motion.div className="cs-scroll-progress" style={{ scaleX }} aria-hidden />
}

const AppContent = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <SmoothScroll />
      <Toaster />
      {!isAdminRoute && <ScrollProgress />}
      {!isAdminRoute && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/movies" element={<PageTransition><Movies /></PageTransition>} />
          <Route path="/new-releases" element={<PageTransition><NewReleases /></PageTransition>} />
          <Route path="/coming-soon" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/cine-lounges" element={<PageTransition><CineLounges /></PageTransition>} />
          <Route path="/movies/:id" element={<PageTransition><MovieDetails /></PageTransition>} />
          <Route path="/movies/:id/:date" element={<PageTransition><SeatLayout /></PageTransition>} />
          <Route path="/checkout/:bookingId" element={<PageTransition><Checkout /></PageTransition>} />
          <Route path="/booking-success" element={<PageTransition><BookingSuccess /></PageTransition>} />
          <Route path="/booking-cancelled" element={<PageTransition><BookingCancelled /></PageTransition>} />
          <Route path="/my-bookings" element={<PageTransition><MyBookings /></PageTransition>} />
          <Route path="/rewards" element={<PageTransition><Rewards /></PageTransition>} />
          <Route path="/verify/:code" element={<PageTransition><Verify /></PageTransition>} />
          <Route path="/favourite" element={<PageTransition><Favorite /></PageTransition>} />
          <Route path="/admin/*" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-shows" element={<AddShows />} />
            <Route path="list-shows" element={<ListShows />} />
            <Route path="list-bookings" element={<ListBooking />} />
            <Route path="scan" element={<AdminScan />} />
          </Route>
        </Routes>
      </AnimatePresence>

      {!isAdminRoute && <Footer />}
    </>
  )
}

const App = () => {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  )
}

export default App
