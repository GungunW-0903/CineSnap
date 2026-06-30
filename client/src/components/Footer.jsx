import React from 'react'
import { assets } from '../assets/assets'
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react'

const Footer = () => {
  return (
        <footer className='section-shell mt-24 md:mt-28 text-gray-200 pb-8'>
            <div className='rounded-4xl border border-white/10 bg-[#0d1425]/80 p-6 md:p-10 lg:p-12 shadow-[0_22px_55px_rgba(0,0,0,0.35)]'>
                <div className='grid md:grid-cols-[1.15fr_0.85fr] gap-10'>
                    <div>
                        <img alt='CineSnap logo' className='h-11' src={assets.logo} />
                        <p className='mt-5 text-sm md:text-base text-gray-300 max-w-xl leading-relaxed'>
                            CineSnap brings movie lovers and theaters together with a fast, visual-first booking experience. Discover what is
                            trending, watch trailers, pick your seats, and secure tickets in moments.
                        </p>

                        <div className='mt-6 flex flex-wrap items-center gap-3'>
                            <img src={assets.googlePlay} alt='Google Play' className='h-10 w-auto hover:-translate-y-1 transition duration-300' />
                            <img src={assets.appStore} alt='App Store' className='h-10 w-auto hover:-translate-y-1 transition duration-300' />
                        </div>

                        <div className='mt-7 inline-flex items-center gap-2 rounded-full border border-[#f9bb8f]/35 bg-[#f9bb8f]/12 px-4 py-2 text-sm text-[#ffd8b4]'>
                            <Sparkles className='w-4 h-4 text-[#ffc24a]' />
                            New premieres and special screening alerts every week
                        </div>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-8'>
                        <div>
                            <h2 className='text-2xl'>Explore</h2>
                            <ul className='mt-4 space-y-2 text-sm text-gray-300'>
                                <li><a href='/' className='hover:text-white transition'>Home</a></li>
                                <li><a href='/movies' className='hover:text-white transition'>Now Showing</a></li>
                                <li><a href='/movies' className='hover:text-white transition'>Upcoming Releases</a></li>
                                <li><a href='/my-bookings' className='hover:text-white transition'>My Bookings</a></li>
                            </ul>
                        </div>

                        <div>
                            <h2 className='text-2xl'>Contact</h2>
                            <div className='mt-4 space-y-3 text-sm text-gray-300'>
                                <p className='flex items-center gap-2'>
                                    <Phone className='w-4 h-4 text-[#ffba69]' />
                                    +1-234-567-890
                                </p>
                                <p className='flex items-center gap-2'>
                                    <Mail className='w-4 h-4 text-[#ffba69]' />
                                    contact@cinesnap.com
                                </p>
                                <p className='flex items-center gap-2'>
                                    <MapPin className='w-4 h-4 text-[#ffba69]' />
                                    Downtown Cinema District
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-8 pt-5 border-t border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400'>
                    <p>Copyright {new Date().getFullYear()} CineSnap. All rights reserved.</p>
                    <p>Crafted for immersive movie discovery and instant ticket booking.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer