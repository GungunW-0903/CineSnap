import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2Icon, XCircleIcon, TicketCheckIcon, Loader2Icon } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import { verifyTicket, checkInTicket } from '../lib/api'

const currency = import.meta.env.VITE_CURRENCY || '$'

// Staff-facing ticket verification — the QR on each ticket points here.
const Verify = () => {
  const { code } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await verifyTicket(code)
    setResult(r)
    setCheckedIn(r?.ticket?.checkedIn || false)
    setLoading(false)
  }

  useEffect(() => { load() }, [code])

  const doCheckIn = async () => {
    setCheckingIn(true)
    const r = await checkInTicket(code)
    setCheckingIn(false)
    if (r.ok) {
      setCheckedIn(true)
      await load()
    } else {
      // Refresh to reflect the real state (e.g. already used).
      await load()
    }
  }

  if (loading) {
    return (
      <div className='min-h-[80vh] flex items-center justify-center'>
        <Loader2Icon className='w-8 h-8 animate-spin text-[#f84565]' />
      </div>
    )
  }

  const ticket = result?.ticket
  const valid = result?.valid && !checkedIn

  return (
    <div className='relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-28 pb-16'>
      <BlurCircle top='100px' left='60px' />
      <BlurCircle bottom='40px' right='80px' />

      <div className='w-full max-w-md rounded-3xl border border-white/10 bg-linear-to-br from-[#121829] to-[#0d1320] overflow-hidden'>
        {/* Status header */}
        <div
          className='p-6 flex items-center gap-3'
          style={{ background: valid ? 'rgba(34,197,94,0.12)' : checkedIn ? 'rgba(255,194,74,0.12)' : 'rgba(239,68,68,0.12)' }}
        >
          {valid ? (
            <CheckCircle2Icon className='w-10 h-10 text-green-400' />
          ) : checkedIn ? (
            <TicketCheckIcon className='w-10 h-10 text-[#ffc24a]' />
          ) : (
            <XCircleIcon className='w-10 h-10 text-red-400' />
          )}
          <div>
            <p className='text-xl font-bold'>
              {valid ? 'Valid ticket' : checkedIn ? 'Already checked in' : 'Not valid'}
            </p>
            <p className='text-sm text-gray-300'>{checkedIn ? 'This ticket was already scanned.' : result?.message}</p>
          </div>
        </div>

        {/* Ticket details */}
        {ticket && (
          <div className='p-6'>
            <div className='flex gap-4'>
              {ticket.poster && <img src={ticket.poster} alt='' className='w-20 rounded-lg object-cover' />}
              <div>
                <p className='text-lg font-bold'>{ticket.movieTitle}</p>
                <p className='text-sm text-gray-400 mt-1'>{ticket.showDate} • {ticket.showTime}</p>
                <p className='text-sm text-gray-400'>Guest: {ticket.userName}</p>
              </div>
            </div>

            <div className='border-t border-white/10 my-4' />

            <div className='flex justify-between text-sm'>
              <span className='text-gray-400'>Seats</span>
              <span className='font-semibold'>{(ticket.seats || []).join(', ')}</span>
            </div>
            <div className='flex justify-between text-sm mt-2'>
              <span className='text-gray-400'>Amount</span>
              <span>{currency}{Number(ticket.totalAmount).toFixed(2)}</span>
            </div>
            <div className='flex justify-between text-sm mt-2'>
              <span className='text-gray-400'>Code</span>
              <span className='font-mono text-gray-200'>{ticket.bookingCode}</span>
            </div>

            {valid && (
              <button
                onClick={doCheckIn}
                disabled={checkingIn}
                className='w-full mt-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold cursor-pointer disabled:opacity-60'
              >
                {checkingIn ? 'Checking in…' : 'Check in ✓'}
              </button>
            )}
          </div>
        )}
      </div>

      <p className='text-xs text-gray-500 mt-6'>CineSnap ticket verification</p>
    </div>
  )
}

export default Verify
