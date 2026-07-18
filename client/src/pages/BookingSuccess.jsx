import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, MailIcon, DownloadIcon, TicketIcon } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import { confirmStripeSession } from '../lib/api'

const currency = import.meta.env.VITE_CURRENCY || '₹'

// Landing page after a successful payment. Renders the full ticket (QR +
// details) in-app so check-in never depends on email delivery — the email is
// a convenience copy, not the ticket itself.
const BookingSuccess = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const sessionId = params.get('session_id')
  const [confirming, setConfirming] = useState(!!sessionId)
  const [emailPreview, setEmailPreview] = useState(location.state?.emailPreview || null)
  const [booking, setBooking] = useState(location.state?.booking || null)
  const ticketEmail = location.state?.ticketEmail || booking?.userEmail || null
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    // If we arrived from Stripe, finalize the booking server-side.
    if (sessionId) {
      confirmStripeSession(sessionId)
        .then((res) => {
          if (res?.emailPreview) setEmailPreview(res.emailPreview)
          if (res?.booking) setBooking(res.booking)
        })
        .finally(() => setConfirming(false))
    }
  }, [sessionId])

  const movie = booking?.movie || booking?.show?.movie || {}
  const seats = booking?.seats || []
  const hasTicket = booking && booking.bookingCode

  const downloadQr = () => {
    if (!booking?.qrCode) return
    const a = document.createElement('a')
    a.href = booking.qrCode
    a.download = `cinesnap-ticket-${booking.bookingCode || 'qr'}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className='relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16'>
      <BlurCircle top='120px' left='60px' />
      <BlurCircle bottom='40px' right='80px' />

      <div className='w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4'>
        <CheckCircleIcon className='w-9 h-9 text-green-400' />
      </div>

      <h1 className='text-3xl font-bold mb-2'>
        {confirming ? 'Confirming your payment…' : 'Booking confirmed!'}
      </h1>
      <p className='text-gray-400 max-w-md'>
        {confirming
          ? 'Hang tight while we finalize your tickets.'
          : hasTicket
            ? 'Here\'s your ticket — show the QR at the counter to check in.'
            : 'Your seats are locked in. Find your ticket under My Bookings.'}
      </p>
      {!confirming && ticketEmail && (
        <p className='text-xs text-gray-500 mt-2 inline-flex items-center gap-1.5'>
          <MailIcon className='w-3.5 h-3.5' />
          A copy is also on its way to {ticketEmail}
        </p>
      )}

      {/* ---- The ticket ---- */}
      {hasTicket && (
        <div className='mt-8 w-full max-w-md text-left rounded-2xl border border-white/10 bg-white/4 backdrop-blur overflow-hidden'>
          <div className='flex items-center gap-2 px-5 py-3 bg-[#f84565]/15 border-b border-white/10'>
            <TicketIcon className='w-4 h-4 text-[#f84565]' />
            <span className='text-sm font-semibold tracking-wide'>CineSnap E-Ticket</span>
          </div>

          <div className='flex gap-4 p-5'>
            {movie.poster_path && (
              <img
                src={movie.poster_path}
                alt=''
                className='w-20 h-28 object-cover rounded-lg shrink-0'
              />
            )}
            <div className='min-w-0'>
              <p className='text-lg font-bold leading-tight'>{movie.title || 'Your movie'}</p>
              <p className='text-sm text-gray-400 mt-1'>{booking.showDate} • {booking.showTime}</p>
              <p className='text-sm mt-2'>
                <span className='text-gray-400'>Seats: </span>
                <span className='font-semibold'>{seats.join(', ')}</span>
              </p>
              <p className='text-sm mt-1'>
                <span className='text-gray-400'>Paid: </span>
                <span className='font-semibold text-[#f84565]'>{currency}{Number(booking.totalAmount).toFixed(2)}</span>
              </p>
            </div>
          </div>

          {booking.qrCode && (
            <div className='flex flex-col items-center gap-2 px-5 pb-5'>
              <div className='bg-white p-2 rounded-xl'>
                <img src={booking.qrCode} alt='Ticket QR code' className='w-40 h-40' />
              </div>
              <p className='font-mono text-xs text-gray-400'>{booking.bookingCode}</p>
              <button
                onClick={downloadQr}
                className='mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-sm hover:border-white/35 transition cursor-pointer'
              >
                <DownloadIcon className='w-4 h-4' />
                Download ticket QR
              </button>
            </div>
          )}
        </div>
      )}

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
