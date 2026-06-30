import React, { useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  return (
    <section id='trailers' className='section-shell py-18 overflow-hidden'>
      <div className='flex flex-wrap items-end justify-between gap-4 reveal-up'>
        <div>
          <p className='text-xs uppercase tracking-[0.22em] text-[#f4b98d]'>Trailers</p>
          <h2 className='text-4xl md:text-5xl mt-1'>Feel the hype before you book</h2>
        </div>
        <p className='text-sm md:text-base text-gray-300 max-w-xl'>
          Watch what everyone's talking about, then tap a poster to switch trailers instantly — and book the moment you're sold.
        </p>
      </div>

      <div className='relative mt-8 reveal-up reveal-delay-1'>
        <BlurCircle top='-100px' right='-100px' />
        <div className='rounded-3xl overflow-hidden border border-white/12 bg-black/35 p-2.5 md:p-4 glass-panel'>
          <div
            className='relative w-full overflow-hidden rounded-2xl bg-black'
            style={{ aspectRatio: '16 / 9' }}
          >
            <ReactPlayer
              key={currentTrailer.videoUrl}
              src={currentTrailer.videoUrl}
              controls
              width='100%'
              height='100%'
              style={{ position: 'absolute', inset: 0 }}
            />
          </div>
        </div>
      </div>

      <div className='group grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 max-w-5xl mx-auto reveal-up reveal-delay-2'>
        {dummyTrailers.map((trailer) => {
          const isSelected = currentTrailer.videoUrl === trailer.videoUrl

          return (
            <button
              type='button'
              key={trailer.image}
              className={`relative overflow-hidden rounded-2xl border transition duration-300 cursor-pointer ${
                isSelected
                  ? 'border-[#ffb55e] scale-[1.02]'
                  : 'border-white/12 group-hover:opacity-65 hover:opacity-100 hover:-translate-y-1'
              }`}
              onClick={() => setCurrentTrailer(trailer)}
            >
              <img src={trailer.image} alt='Movie trailer preview' className='w-full h-28 md:h-36 object-cover brightness-75' />
              <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent' />
              <PlayCircleIcon className='absolute inset-0 m-auto w-11 h-11 text-white/92' strokeWidth={1.4} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default TrailerSection