import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircleIcon } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'

// Landing page when a payment is cancelled or abandoned.
const BookingCancelled = () => {
  const navigate = useNavigate()
  return (
    <div className='relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6'>
      <BlurCircle top='120px' left='60px' />
      <BlurCircle bottom='40px' right='80px' />

      <div className='w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mb-6'>
        <XCircleIcon className='w-11 h-11 text-red-400' />
      </div>

      <h1 className='text-3xl font-bold mb-3'>Payment cancelled</h1>
      <p className='text-gray-400 max-w-md'>
        No charge was made. Your booking is still pending — you can pay for it anytime from My Bookings.
      </p>

      <div className='flex gap-4 mt-8'>
        <button onClick={() => navigate('/my-bookings')} className='btn-cinesnap px-7 py-3'>
          Go to my bookings
        </button>
        <button
          onClick={() => navigate('/movies')}
          className='px-7 py-3 rounded-full border border-white/15 hover:border-white/30 transition cursor-pointer'
        >
          Browse movies
        </button>
      </div>
    </div>
  )
}

export default BookingCancelled
