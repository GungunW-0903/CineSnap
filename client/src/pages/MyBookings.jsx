import React,{useEffect, useState} from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import toast from 'react-hot-toast'
import { useUser } from '@clerk/clerk-react'
import { fetchMyBookings, confirmBookingPayment, cancelBooking } from '../lib/api'
import { useProfile } from '../context/ProfileContext'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$'
  const { user } = useUser()
  const { refresh } = useProfile()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const getMyBookings = async () => {
    const data = await fetchMyBookings(user)
    setBookings(data)
    setIsLoading(false)
  }

  useEffect(() => {
    getMyBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handlePay = async (id) => {
    setBusyId(id)
    const t = toast.loading('Processing payment…')
    const res = await confirmBookingPayment(id, user)
    if (res.ok) {
      toast.success('Payment successful! 🎬', { id: t })
      refresh() // loyalty points/tier just changed
      await getMyBookings()
    } else {
      toast.error(res.error || 'Payment failed', { id: t })
    }
    setBusyId(null)
  }

  const handleCancel = async (id) => {
    setBusyId(id)
    const t = toast.loading('Cancelling…')
    const res = await cancelBooking(id, user)
    if (res.ok) {
      toast.success('Booking cancelled', { id: t })
      await getMyBookings()
    } else {
      toast.error(res.error || 'Could not cancel', { id: t })
    }
    setBusyId(null)
  }

  if (isLoading) return <Loading />

  return (
    <div className='relative px:6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" right="300px" />
      </div>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.length === 0 && (
        <p className='text-gray-400 mt-6'>You have no bookings yet. Pick a movie and grab your seats!</p>
      )}

      {bookings.map((item, index) => (
        <div key={item._id || index} className='flex flex-col md:flex-row justify-between bg-[#f84565]/8 border border-[#f84565]/20 rounded-lg mt-4 p-2 max-w-3xl '>
          <div className='flex flex-col md:flex-row'>
            {item.poster && (
              <img src={item.poster} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />
            )}
            <div className='flex flex-col mt-4 px-4'>
              <p className='text-lg font-bold'>{item.title}</p>
              {item.runtime ? <p className='text-gray-400 text-sm'>{timeFormat(item.runtime)}</p> : null}
              <p className='text-gray-400 text-sm mt-3'>{item.dateLabel}</p>
              {item.isCancelled && <p className='text-xs text-red-400 mt-1'>Cancelled</p>}
            </div>
          </div>
          <div className='flex flex-col md:items-end md:text-right p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
              {!item.isPaid && !item.isCancelled && (
                <button
                  onClick={() => handlePay(item._id)}
                  disabled={busyId === item._id}
                  className='bg-[#f84565] px-4 py-2 text-sm rounded-full font-medium cursor-pointer disabled:opacity-60'
                >
                  {busyId === item._id ? '…' : 'Pay Now'}
                </button>
              )}
            </div>
            <div>
              <p><span className='text-gray-400 text-sm gap-2'>Total Tickets:  </span>{item.seats.length}</p>
              <p><span className='text-gray-400 text-sm gap-2'>Seat Number:  </span>{item.seats.join(", ")}</p>
            </div>
            {/* Digital QR ticket — scannable at the door */}
            {item.isPaid && item.qr && (
              <div className='mt-3 flex flex-col items-center md:items-end'>
                <img src={item.qr} alt='Ticket QR code' className='w-24 h-24 rounded-lg bg-white p-1' />
                <p className='text-[10px] text-gray-400 mt-1 font-mono'>{item.bookingCode}</p>
                {item.isUsed && <p className='text-[10px] text-[#ffc24a] mt-0.5'>Checked in ✓</p>}
              </div>
            )}
            {!item.isCancelled && item._id && (
              <button
                onClick={() => handleCancel(item._id)}
                disabled={busyId === item._id}
                className='mt-2 text-xs text-gray-400 hover:text-red-400 transition cursor-pointer disabled:opacity-60'
              >
                Cancel booking
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyBookings
