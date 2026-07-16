import React, { useEffect } from 'react'
import ReactPlayer from 'react-player'
import { XIcon } from 'lucide-react'

const TrailerModal = ({ url, title, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!url) return null

  return (
    <div
      className='fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-8'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label={title ? `${title} trailer` : 'Trailer'}
    >
      <div
        className='relative w-full max-w-4xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-3'>
          <p className='text-sm md:text-base text-white/90 truncate pr-4'>
            {title ? `${title} — Official Trailer` : 'Official Trailer'}
          </p>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close trailer'
            className='flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer'
          >
            <XIcon className='w-5 h-5' />
          </button>
        </div>

        <div
          className='relative w-full overflow-hidden rounded-2xl bg-black border border-white/12'
          style={{ aspectRatio: '16 / 9' }}
        >
          <ReactPlayer
            src={url}
            controls
            playing
            width='100%'
            height='100%'
            style={{ position: 'absolute', inset: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export default TrailerModal
