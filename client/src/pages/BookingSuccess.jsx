import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, MailIcon } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import { confirmStripeSession } from '../lib/api'

// Landing page after a successful payment (both Stripe redirect and demo path).
const BookingSuccess = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const sessionId = params.get('session_id')
  const [confirming, setConfirming] = useState(!!sessionId)
  const [emailPreview, setEmailPreview] = useState(location.state?.emailPreview || null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    // If we arrived from Stripe, finalize the booking server-side.
    if (sessionId) {
      confirmStripeSession(sessionId)
        .then((res) => { if (res?.emailPreview) setEmailPreview(res.emailPreview) })
        .finally(() => setConfirming(false))
    }
  }, [sessionId])

  return (
    <div className='relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6'>
      <BlurCircle top='120px' left='60px' />
      <BlurCircle bottom='40px' right='80px' />

      <div className='w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-6'>
        <CheckCircleIcon className='w-11 h-11 text-green-400' />
      </div>

      <h1 className='text-3xl font-bold mb-3'>
        {confirming ? 'Confirming your payment…' : 'Booking confirmed!'}
      </h1>
      <p className='text-gray-400 max-w-md'>
        {confirming
          ? 'Hang tight while we finalize your tickets.'
          : 'Your seats are locked in and a confirmation email has been sent. 🎬'}
      </p>

      {emailPreview && (
        <a
          href={emailPreview}
          target='_blank'
          rel='noreferrer'
          className='mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#ffc24a]/40 bg-[#ffc24a]/10 text-[#ffc24a] text-sm hover:bg-[#ffc24a]/20 transition'
        >
          <MailIcon className='w-4 h-4' />
          View your confirmation email
        </a>
      )}

      <div className='flex gap-4 mt-8'>
        <button onClick={() => navigate('/my-bookings')} className='btn-cinesnap px-7 py-3'>
          View my bookings
        </button>
        <button
          onClick={() => navigate('/movies')}
          className='px-7 py-3 rounded-full border border-white/15 hover:border-white/30 transition cursor-pointer'
        >
          Book more
        </button>
      </div>
    </div>
  )
}

export default BookingSuccess
