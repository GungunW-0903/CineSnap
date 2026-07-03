import React,{ useEffect, useState } from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import Loading from '../components/Loading'
import { ClockIcon,ArrowRightIcon } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'
import { useAuthUser } from '../lib/authUser'
import { fetchShowsForMovie, fetchShowById, createBooking } from '../lib/api'

// Times come from the backend as "11:00 AM"; sample data uses ISO strings.
function formatTime(t) {
  if (typeof t === 'string' && t.includes('T')) {
    return new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return t
}

const SeatLayout = () => {
  const groupRows = [["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]
  const { id,date } =useParams()
  const { user } = useAuthUser()
  const [selectedSeats,setSelectedSeats] =useState([])
  const [selectedTime,setSelectedTime] =useState(null)
  const [occupied,setOccupied] =useState([])
  const [show,setShow] =useState(null)
  const [booking,setBooking] =useState(false)

  const navigate=useNavigate()

  const getShow = async ()=>{
    const dateTime = await fetchShowsForMovie(id)
    setShow({ dateTime })
  }

  useEffect(()=>{ getShow() },[id])

  // When a showtime is picked, load its occupied seats so they can't be re-picked.
  useEffect(()=>{
    let cancelled = false
    async function loadOccupied() {
      setSelectedSeats([])
      if (!selectedTime?.showId) { setOccupied([]); return }
      const full = await fetchShowById(selectedTime.showId)
      if (!cancelled) setOccupied(full?.occupiedSeats || [])
    }
    loadOccupied()
    return () => { cancelled = true }
  },[selectedTime])

  const handleSeatClick = (seatId)=>{
    if(!selectedTime){
      toast.error("Please select Time first")
      return
    }
    if(occupied.includes(seatId)){
      toast.error("That seat is already taken")
      return
    }
    if(selectedSeats.includes(seatId)){
      setSelectedSeats(selectedSeats.filter(prev=>prev!==seatId))
    } else {
      if(selectedSeats.length<5){
        setSelectedSeats([...selectedSeats,seatId])
      } else {
        toast.error("You can select only 5 seats")
      }
    }
  }

  const renderSeats =(row,count=9)=> (
    <div key ={row} className=''>
      <div>
        {Array.from({length:count}, (_,i) =>{
          const seatId = `${row}${i+1}`
          const isTaken = occupied.includes(seatId)
          const isSelected = selectedSeats.includes(seatId)
          return(
            <button
              key={seatId}
              onClick={()=>handleSeatClick(seatId)}
              disabled={isTaken}
              className={`h-8 w-8 rounded border border-[#f84565]/60 cursor-pointer ${isSelected ? "bg-[#f84565] text-white" : ""} ${isTaken ? "opacity-30 cursor-not-allowed line-through" : ""}`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  const handleCheckout = async () => {
    if (!selectedTime?.showId) { toast.error('Please select a showtime'); return }
    if (selectedSeats.length === 0) { toast.error('Please select at least one seat'); return }

    setBooking(true)
    const t = toast.loading('Reserving your seats…')
    try {
      const res = await createBooking({ showId: selectedTime.showId, seats: selectedSeats }, user)
      if (!res.ok) { toast.error(res.error || 'Could not create booking', { id: t }); return }

      // Seats are held (pending) — send the user to the payment step.
      toast.dismiss(t)
      navigate(`/checkout/${res.booking._id}`)
    } catch (err) {
      toast.error(err.message || 'Something went wrong', { id: t })
    } finally {
      setBooking(false)
    }
  }

  const times = show?.dateTime?.[date] || []

  return show ? (
    <div className='flex  px-6 md:px-16 lg:px-40 py-30 mt-10'>
       <div className='w-60 bg-[#f84565]/10 border border-[#f84565]/20 rounded py-10 h-max md:top-30'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5'>
          {times.length === 0 && (
            <p className='text-sm text-gray-400 px-6'>No showtimes for this date.</p>
          )}
          {times.map((item)=>{
            const left = item.availableSeats
            const low = typeof left === 'number' && left <= 20
            const soldOut = typeof left === 'number' && left <= 0
            return (
            <div key={item.showId || item.time} onClick={()=>!soldOut && setSelectedTime(item)} className={`flex flex-col px-6 py-2 w-max rounded-r-md transition ${soldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${selectedTime?.showId === item.showId ? "bg-[#f84565] text-white" : soldOut ? "" : "hover:bg-[#f84565]/20"}`}>
              <div className='flex items-center gap-2'>
                <ClockIcon className='w-5 h-5' />
                <p className='text-sm'>{formatTime(item.time)}{item.ticketPrice ? ` · $${item.ticketPrice}` : ''}</p>
              </div>
              {soldOut ? (
                <span className='text-[11px] text-gray-400 pl-7'>Sold out</span>
              ) : low ? (
                <span className='text-[11px] text-[#ffc24a] pl-7'>🔥 Only {left} seats left</span>
              ) : null}
            </div>
          )})}
        </div>
       </div>
       <div className='relative flex-1 flex flex-col items-center max-md:mt-16 '>
        <BlurCircle top='0px' left='0px'/>
        <BlurCircle bottom='0px' right='0px' />
        <h1 className='text-2xl font-semibold mb-4'>Select Your Seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>
        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row=>renderSeats(row))}
          </div>
        </div>
        <div className='flex flex-wrap gap-11 px-20 text-sm font-medium'>
          {groupRows.slice(1).map((group,idx)=>(
            <div key={idx}>
              {group.map(row=>renderSeats(row))}
            </div>
          ))}
        </div>
       <button onClick={handleCheckout} disabled={booking} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-[#f84565] hover:bg-[#D63854] transition rounded-full font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
        {booking ? 'Processing…' : 'Proceed to Checkout'}
        <ArrowRightIcon strokeWidth={3} className='w-4.5 h-4.5' />
       </button>
       </div>

       </div>

  ) :(
    <div><Loading /></div>
  )
}


export default SeatLayout
