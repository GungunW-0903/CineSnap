import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import { dummyShowsData } from '../assets/assets'
import MovieCard from './MovieCard'

const FeaturedSection = () => {
  const navigate = useNavigate()

  return (
    <section className='relative section-shell overflow-hidden py-18'>
      <BlurCircle top='40px' right='-90px' />

      <div className='flex flex-wrap items-end justify-between gap-4 reveal-up'>
        <div>
          <p className='text-xs uppercase tracking-[0.22em] text-[#f4b98d]'>Now showing</p>
          <h2 className='text-4xl md:text-5xl mt-1'>Pick your perfect show</h2>
        </div>
        <button
          onClick={() => {
            navigate('/movies')
            window.scrollTo(0, 0)
          }}
          className='text-sm text-gray-200 border border-white/20 px-4 py-2 rounded-full hover:bg-white/10 transition flex items-center gap-2 cursor-pointer'
        >
          View full lineup
          <ArrowRight className='w-4 h-4' />
        </button>
      </div>

      <p className='text-gray-300 text-sm md:text-base max-w-2xl mt-4 reveal-up reveal-delay-1'>
        Fresh releases, fan favorites, and high-demand premieres are ready to book. Catch the buzz before seats disappear.
      </p>

      <div className='grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-10 reveal-up reveal-delay-2'>
        {dummyShowsData.slice(0, 4).map((show) => (
          <MovieCard key={show._id} movie={show} />
        ))}
      </div>

      <div className='flex items-center justify-center mt-12 reveal-up reveal-delay-3'>
        <button onClick={() => navigate('/movies')} className='btn-cinesnap px-7'>
          Discover More Movies
        </button>
      </div>
    </section>
  )
}

export default FeaturedSection