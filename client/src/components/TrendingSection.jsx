import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Star, Flame } from 'lucide-react'
import BlurCircle from './BlurCircle'
import { fetchTrending } from '../lib/api'

// Live "Now Trending" rail — ranks movies by popularity/views from the backend,
// with a graceful fallback to sample data.
const TrendingSection = () => {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchTrending(8).then((list) => { if (!cancelled) setMovies(list) })
    return () => { cancelled = true }
  }, [])

  if (!movies.length) return null

  const open = (id) => { navigate(`/movies/${id}`); window.scrollTo(0, 0) }

  return (
    <section className='relative section-shell overflow-hidden py-18'>
      <BlurCircle top='40px' left='-90px' />

      <div className='flex items-center gap-2'>
        <Flame className='w-5 h-5 text-[#f84565]' />
        <p className='text-xs uppercase tracking-[0.22em] text-[#f4b98d]'>Now trending</p>
      </div>
      <h2 className='text-4xl md:text-5xl mt-1'>What everyone's watching</h2>

      {/* Horizontal scroll rail */}
      <div className='flex gap-5 mt-10 overflow-x-auto pb-4 -mx-2 px-2 snap-x scrollbar-none'>
        {movies.map((m, i) => (
          <button
            key={m._id}
            onClick={() => open(m._id)}
            className='group relative shrink-0 w-44 md:w-52 text-left snap-start cursor-pointer'
          >
            {/* Rank badge */}
            <span className='absolute -top-2 -left-2 z-10 h-8 w-8 rounded-full bg-linear-to-br from-[#f84565] to-[#ffc24a] text-white text-sm font-bold flex items-center justify-center shadow-lg'>
              {i + 1}
            </span>
            <div className='overflow-hidden rounded-2xl border border-white/10'>
              <img
                src={m.poster_path}
                alt={m.title}
                className='h-64 md:h-72 w-full object-cover transition duration-500 group-hover:scale-105'
              />
            </div>
            <div className='mt-3'>
              <p className='font-semibold truncate'>{m.title}</p>
              <div className='flex items-center gap-3 text-xs text-gray-400 mt-1'>
                <span className='flex items-center gap-1'>
                  <Star className='w-3.5 h-3.5 text-[#f84565] fill-[#f84565]' />
                  {Number(m.vote_average || 0).toFixed(1)}
                </span>
                {typeof m.viewCount === 'number' && m.viewCount > 0 && (
                  <span className='flex items-center gap-1'>
                    <TrendingUp className='w-3.5 h-3.5' />
                    {m.viewCount.toLocaleString()} views
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default TrendingSection
