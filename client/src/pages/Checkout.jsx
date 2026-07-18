import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthUser } from '../lib/authUser'
import toast from 'react-hot-toast'
import { ShieldCheckIcon, TicketIcon, ZapIcon, LockIcon, WalletIcon, TagIcon, MailIcon } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import {
  fetchBookingById,
  fetchPaymentConfig,
  loadRazorpayScript,
  createRazorpayOrder,
  verifyRazorpayPayment,
  confirmBookingPayment,
  applyPromo,
} from '../lib/api'
import { useProfile } from '../context/ProfileContext'
import { getIdentity } from '../lib/identity'

const currency = import.meta.env.VITE_CURRENCY || '₹'

// Synthetic addresses minted for guests/no-email users — never deliverable,
// so don't prefill them; make the customer type a real inbox instead.
const SYNTHETIC_EMAIL_RE = /@(guest|user)\.cinesnap\.app$/i
const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Checkout = () => {
  const { bookingId } = useParams()
  const { user } = useAuthUser()
  const { refresh } = useProfile()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState('razorpay')
  const [razorpayEnabled, setRazorpayEnabled] = useState(null) // null = still checking
  const [paying, setPaying] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null) // { label, discount }
  const [applyingPromo, setApplyingPromo] = useState(false)
  // Where the tickets get emailed. Prefilled from the signed-in user's real
  // address; guests (synthetic @guest.cinesnap.app identity) must type one.
  const [ticketEmail, setTicketEmail] = useState(() => {
    const { userEmail } = getIdentity(user)
    return SYNTHETIC_EMAIL_RE.test(userEmail || '') ? '' : userEmail || ''
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [b, cfg] = await Promise.all([
        fetchBookingById(bookingId, user),
        fetchPaymentConfig(),
      ])
      if (!cancelled) {
        setBooking(b)
        const enabled = !!cfg?.razorpay?.enabled
        setRazorpayEnabled(enabled)
        if (!enabled) setMethod('demo') // keys not configured → demo is the default
        setLoading(false)
      }
    }
    load()
    // Warm the Razorpay script in the background so the modal opens instantly.
    loadRazorpayScript()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, user?.id])

  // Clerk resolves the user asynchronously — prefill the ticket email once the
  // real address arrives, but never overwrite something the customer typed.
  useEffect(() => {
    if (ticketEmail) return
    const { userEmail } = getIdentity(user)
    if (userEmail && !SYNTHETIC_EMAIL_RE.test(userEmail)) setTicketEmail(userEmail)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const movie = booking?.movie || booking?.show?.movie || {}

  // Completes the flow after any successful payment path.
  const onPaid = (t, emailPreview) => {
    toast.success('Payment successful! 🎬', { id: t })
    refresh() // update loyalty points/tier now that this booking earned points
    navigate('/booking-success', { state: { emailPreview } })
  }

  const payWithRazorpay = async () => {
    const t = toast.loading('Opening secure Razorpay checkout…')

    const scriptOk = await loadRazorpayScript()
    if (!scriptOk) {
      toast.error('Could not load Razorpay — check your connection.', { id: t })
      setPaying(false)
      return
    }

    const res = await createRazorpayOrder(bookingId, user, ticketEmail.trim())
    if (!res.ok) {
      // Keys missing / backend down → guide the user to the demo path.
      toast.error(res.error || 'Razorpay is not available — try Demo Payment.', { id: t })
      setMethod('demo')
      setPaying(false)
      return
    }

    const { orderId, amount, currency: orderCurrency, keyId, booking: orderBooking } = res.order
    toast.dismiss(t)

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency: orderCurrency,
      name: 'CineSnap',
      description: `${orderBooking?.movieTitle || 'Movie tickets'} — ${(orderBooking?.seats || []).join(', ')}`,
      order_id: orderId,
      prefill: {
        name: orderBooking?.userName || '',
        email: ticketEmail.trim() || orderBooking?.userEmail || '',
      },
      theme: { color: '#f84565' },
      handler: async (response) => {
        // Razorpay says the payment went through — verify the signature
        // server-side before treating the booking as paid.
        const vt = toast.loading('Verifying payment…')
        const verified = await verifyRazorpayPayment(response, user)
        setPaying(false)
        if (verified.ok) {
          onPaid(vt, verified.emailPreview)
        } else {
          toast.error(verified.error || 'Payment verification failed.', { id: vt })
        }
      },
      modal: {
        ondismiss: () => {
          setPaying(false)
          toast('Payment cancelled — your seats are still held.', { icon: 'ℹ️' })
        },
      },
    })

    rzp.on('payment.failed', (response) => {
      setPaying(false)
      toast.error(response?.error?.description || 'Payment failed. Please try again.')
    })

    rzp.open()
  }

  const handlePay = async () => {
    if (paying) return
    // Tickets are delivered by email — refuse to charge before we have a real
    // inbox to send them to (guests otherwise get an undeliverable address).
    if (!VALID_EMAIL_RE.test(ticketEmail.trim())) {
      toast.error('Enter a valid email — that\'s where your tickets will be sent.')
      return
    }
    setPaying(true)

    if (method === 'razorpay') {
      await payWithRazorpay()
      return
    }

    // Demo / test-mode payment (no external keys needed).
    const t = toast.loading('Processing payment…')
    const res = await confirmBookingPayment(bookingId, user, ticketEmail.trim())
    setPaying(false)
    if (res.ok) {
      onPaid(t, res.emailPreview)
    } else {
      toast.error(res.error || 'Payment failed', { id: t })
    }
  }

  const handleApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setApplyingPromo(true)
    const res = await applyPromo(bookingId, code, user)
    setApplyingPromo(false)
    if (res.ok) {
      setPromo({ label: res.label, discount: res.discount })
      setBooking((b) => ({ ...b, totalAmount: res.totalAmount, originalAmount: res.originalAmount }))
      toast.success(`${res.label} applied!`)
    } else {
      toast.error(res.error || 'Invalid promo code')
    }
  }

  if (loading) return <Loading />

  if (!booking) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4'>
        <p className='text-gray-300'>We couldn't find that booking.</p>
        <button onClick={() => navigate('/movies')} className='btn-cinesnap px-6 py-2.5'>Browse movies</button>
      </div>
    )
  }

  const seats = booking.seats || []
  const total = booking.totalAmount

  return (
    <div className='relative px-6 md:px-16 lg:px-40 pt-32 md:pt-40 pb-20 min-h-[85vh]'>
      <BlurCircle top='80px' left='0px' />
      <BlurCircle bottom='0px' right='60px' />

      <h1 className='text-2xl font-semibold mb-8'>Checkout</h1>

      <div className='flex flex-col lg:flex-row gap-8 max-w-5xl'>
        {/* Order summary */}
        <div className='flex-1 bg-[#f84565]/8 border border-[#f84565]/20 rounded-2xl p-6'>
          <div className='flex gap-4'>
            {movie.poster_path && (
              <img src={movie.poster_path} alt='' className='w-24 rounded-lg object-cover' />
            )}
            <div>
              <p className='text-lg font-bold'>{movie.title || 'Your movie'}</p>
              <p className='text-gray-400 text-sm mt-1'>{booking.showDate} • {booking.showTime}</p>
              <p className='text-gray-400 text-sm mt-1'>Booking code: <span className='font-mono text-gray-200'>{booking.bookingCode || '—'}</span></p>
            </div>
          </div>

          <div className='border-t border-white/10 my-5' />

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Seats ({seats.length})</span>
              <span className='font-medium'>{seats.join(', ')}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Subtotal</span>
              <span>{currency}{Number(booking.originalAmount ?? total).toFixed(2)}</span>
            </div>
            {promo && (
              <div className='flex justify-between text-green-400'>
                <span>Promo ({promo.label})</span>
                <span>−{currency}{Number(promo.discount).toFixed(2)}</span>
              </div>
            )}
            <div className='flex justify-between text-lg font-semibold pt-2'>
              <span>Total</span>
              <span className='text-[#ffc24a]'>{currency}{Number(total).toFixed(2)}</span>
            </div>
          </div>

          {/* Promo code */}
          {!promo && (
            <div className='flex gap-2 mt-5'>
              <div className='flex-1 flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3'>
                <TagIcon className='w-4 h-4 text-gray-400' />
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder='Promo code'
                  className='flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-500 uppercase'
                />
              </div>
              <button
                onClick={handleApplyPromo}
                disabled={applyingPromo || !promoInput.trim()}
                className='px-4 rounded-xl border border-white/15 hover:border-white/35 transition text-sm cursor-pointer disabled:opacity-50'
              >
                {applyingPromo ? '…' : 'Apply'}
              </button>
            </div>
          )}
          {!promo && (
            <p className='text-[11px] text-gray-500 mt-2'>Try <span className='font-mono text-gray-300'>CINE10</span>, <span className='font-mono text-gray-300'>WEEKEND15</span>, or <span className='font-mono text-gray-300'>FIRST50</span></p>
          )}

          <div className='flex items-center gap-2 text-xs text-gray-500 mt-6'>
            <ShieldCheckIcon className='w-4 h-4' />
            Payments are encrypted. Your card details never touch our servers.
          </div>
        </div>

        {/* Payment methods */}
        <div className='flex-1 max-w-md'>
          <p className='text-sm font-semibold text-gray-300 mb-2'>Email for tickets</p>
          <div className='relative mb-5'>
            <MailIcon className='w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
            <input
              type='email'
              value={ticketEmail}
              onChange={(e) => setTicketEmail(e.target.value)}
              placeholder='you@example.com'
              className='w-full bg-white/5 border border-white/10 focus:border-[#f84565] outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition'
            />
            <p className='text-[11px] text-gray-500 mt-1.5'>Your ticket & QR code will be sent here — show it at the counter.</p>
          </div>

          <p className='text-sm font-semibold text-gray-300 mb-3'>Payment method</p>

          <button
            onClick={() => setMethod('razorpay')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border mb-3 transition text-left ${method === 'razorpay' ? 'border-[#f84565] bg-[#f84565]/10' : 'border-white/10 hover:border-white/25'}`}
          >
            <WalletIcon className='w-5 h-5 text-[#f84565]' />
            <div className='flex-1'>
              <p className='font-medium'>UPI / Card / Netbanking</p>
              <p className='text-xs text-gray-400'>Secure checkout via Razorpay</p>
            </div>
            {razorpayEnabled === false && (
              <span className='text-[10px] uppercase tracking-wide text-gray-500 border border-white/10 rounded px-1.5 py-0.5'>Needs keys</span>
            )}
          </button>

          <button
            onClick={() => setMethod('demo')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border mb-5 transition text-left ${method === 'demo' ? 'border-[#f84565] bg-[#f84565]/10' : 'border-white/10 hover:border-white/25'}`}
          >
            <ZapIcon className='w-5 h-5 text-[#ffc24a]' />
            <div>
              <p className='font-medium'>Demo Payment <span className='text-[10px] uppercase tracking-wide text-[#ffc24a] ml-1'>Test mode</span></p>
              <p className='text-xs text-gray-400'>Complete instantly — no card required</p>
            </div>
          </button>

          <button
            onClick={handlePay}
            disabled={paying}
            className='w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-linear-to-r from-[#f84565] to-[#ffc24a] text-white font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <LockIcon className='w-4 h-4' />
            {paying ? 'Processing…' : `Pay ${currency}${Number(total).toFixed(2)}`}
          </button>

          <button
            onClick={() => navigate('/booking-cancelled')}
            className='w-full text-center text-xs text-gray-500 hover:text-gray-300 mt-4 cursor-pointer'
          >
            Cancel and go back
          </button>

          {method === 'razorpay' && (
            <div className='flex items-start gap-2 text-xs text-gray-500 mt-5'>
              <TicketIcon className='w-4 h-4 mt-0.5 shrink-0' />
              <span>Test card: <span className='font-mono text-gray-300'>4111 1111 1111 1111</span>, any future date & CVV. Test UPI: <span className='font-mono text-gray-300'>success@razorpay</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Checkout
