import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { SearchIcon, XIcon, MenuIcon, TicketPlus, Sparkles } from 'lucide-react'
import { useUser, useClerk, UserButton } from '@clerk/clerk-react'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Movies', path: '/movies' },
  { label: 'Cine Lounges', path: '/movies' },
  { label: 'New Releases', path: '/movies' },
  { label: 'Favorites', path: '/favourite' }
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { openSignIn } = useClerk()
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

          {!user ? (
            <button onClick={openSignIn} className='btn-cinesnap text-sm px-4 py-2 md:px-5 md:py-2.5'>
              <Sparkles className='w-4 h-4' />
              Join Now
            </button>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label='My Bookings'
                  labelIcon={<TicketPlus width={15} />}
                  onClick={() => navigate('/my-bookings')}
                />
              </UserButton.MenuItems>
            </UserButton>
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