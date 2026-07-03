import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { SearchIcon, XIcon, MenuIcon, TicketPlus, Sparkles, Crown } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'
import { useAuthUser } from '../lib/authUser'
import { useProfile, tierInfo } from '../context/ProfileContext'

// Loyalty points + tier badge — links to the Rewards page.
const LoyaltyBadge = () => {
  const { profile } = useProfile()
  const navigate = useNavigate()
  if (!profile) return null

  const { current } = tierInfo(profile.loyaltyPoints || 0)
  return (
    <button
      onClick={() => { navigate('/rewards'); scrollTo(0, 0) }}
      className='hidden sm:flex items-center gap-2 rounded-full pl-2.5 pr-3 py-1.5 border border-white/15 hover:border-white/35 transition cursor-pointer'
      title={`${current.name} tier · ${profile.loyaltyPoints || 0} points`}
    >
      <Crown className='w-4 h-4' style={{ color: current.color }} />
      <span className='text-xs font-semibold' style={{ color: current.color }}>{current.name}</span>
      <span className='text-xs text-gray-300'>{profile.loyaltyPoints || 0} pts</span>
    </button>
  )
}

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Movies', path: '/movies' },
  { label: 'Cine Lounges', path: '/movies' },
  { label: 'New Releases', path: '/movies' },
  { label: 'Favorites', path: '/favourite' }
]

const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

const AuthControls = () => {
  // Only call Clerk hooks if Clerk is actually configured.
  const { user } = useAuthUser()
  const navigate = useNavigate()

  if (!user) {
    // If we can't use Clerk (not configured), don't try to sign in — just
    // show an "Explore" button. useAuthUser() returns null when Clerk isn't set.
    return (
      <button onClick={() => navigate('/movies')} className='btn-cinesnap text-sm px-4 py-2 md:px-5 md:py-2.5'>
        <Sparkles className='w-4 h-4' />
        Explore
      </button>
    )
  }

  // Clerk is configured and user is signed in — show the profile menu.
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label='My Bookings'
          labelIcon={<TicketPlus width={15} />}
          onClick={() => navigate('/my-bookings')}
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navigate = useNavigate()

  const closeMenu = () => {
    setIsOpen(false)
  }

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname.startsWith(path)
  }

  return (
    <header className='fixed top-0 left-0 z-50 w-full'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-[#03060c]/95 via-[#03060c]/60 to-transparent backdrop-blur-md' />

      <div className='section-shell flex items-center justify-between py-3 md:py-4'>
        <Link to='/' onClick={() => { scrollTo(0, 0); closeMenu() }}>
          <img src={assets.logo} alt='CineSnap logo' className='w-32 md:w-36 h-auto transition duration-300 hover:scale-105' />
        </Link>

        <nav className='hidden md:flex items-center gap-1 rounded-full px-2 py-1 glass-panel'>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => {
                scrollTo(0, 0)
                closeMenu()
              }}
              className={`px-4 py-2 text-sm rounded-full transition ${
                isLinkActive(link.path)
                  ? 'bg-white/18 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-3 md:gap-5'>
          <button
            onClick={() => {
              navigate('/movies')
              scrollTo(0, 0)
            }}
            className='hidden md:flex items-center justify-center h-10 w-10 rounded-full border border-white/20 text-gray-300 hover:text-white hover:border-white/45 transition cursor-pointer'
            aria-label='Search movies'
          >
            <SearchIcon className='w-4 h-4' />
          </button>

          <LoyaltyBadge />

          {clerkEnabled ? (
            <AuthControls />
          ) : (
            <button onClick={() => navigate('/movies')} className='btn-cinesnap text-sm px-4 py-2 md:px-5 md:py-2.5'>
              <Sparkles className='w-4 h-4' />
              Explore
            </button>
          )}

          <button
            className='md:hidden flex items-center justify-center h-10 w-10 rounded-full border border-white/25 text-gray-200 cursor-pointer'
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label='Open mobile menu'
          >
            {isOpen ? <XIcon className='w-5 h-5' /> : <MenuIcon className='w-5 h-5' />}
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className='section-shell pb-4'>
          <nav className='glass-panel rounded-3xl p-4 flex flex-col gap-2'>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => {
                  scrollTo(0, 0)
                  closeMenu()
                }}
                className={`px-4 py-2 rounded-xl text-sm transition ${
                  isLinkActive(link.path)
                    ? 'bg-white/16 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar
