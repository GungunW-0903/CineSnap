import React,{ useEffect, useState } from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon,ArrowRightIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

const SeatLayout = () => {
 const groupRows = [["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]
  const { id,date } =useParams()
  const [selectedSeats,setSelectedSeats] =useState([])
  const [selectedTime,setSelectedTime] =useState(null)
  const [show,setShow] =useState(null)

  const navigate=useNavigate()
 
   const getShow =async ()=>{
    const show=dummyShowsData.find(show=>show._id===id)
    if(show){
      setShow({
        movie:show,
        dateTime:dummyDateTimeData
      })
    }
   }

   const handleSeatClick = (seatId)=>{
    if(!selectedTime){
       toast.error("Please select Time first")
       return;  
    }
    if(selectedSeats.includes(seatId)){
      setSelectedSeats(selectedSeats.filter(prev=>prev!==seatId))

    }
    else{
        if(selectedSeats.length<5){
        setSelectedSeats([...selectedSeats,seatId])
      }
      else{
        toast.error("You can select only 5 seats")
        return;
      }
    }
     

  }
   const renderSeats =(row,count=9)=> (
    <div key ={row} className=''>
      <div>
        {Array.from({length:count}, (_,i) =>{
          const seatId = `${row}${i+1}`;
          return(
            <button key={seatId} onClick={()=>handleSeatClick(seatId)} className={`h-8 w-8 rounded border border-[#f84565]/60 cursor-pointer ${selectedSeats.includes(seatId) && "bg-[#f84565] text-white"}`}>
              {seatId}

            </button>
          )

        })}

      

        
      </div>
    </div>
   )
   useEffect(()=>{
    getShow()

   },[])
  //  console.log(show.dateTime[date])

  return show ? (
    <div className='flex  px-6 md:px-16 lg:px-40 py-30 mt-10'>
       <div className='w-60 bg-[#f84565]/10 border border-[#f84565]/20 rounded py-10 h-max md:top-30'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5'>
          {show.dateTime[date].map((item)=>(
            <div key={item.time} onClick={()=>setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-[#f84565] text-white" : "hover:bg-[#f84565]/20"}`}>
              <ClockIcon className='w-5 h-5' />
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
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
       <button onClick={()=>navigate('/my-bookings')} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-[#f84565] hover:bg-[#D63854] transition rounded-full font-medium cursor-pointer '>
        Proceed to Checkout
        <ArrowRightIcon strokeWidth={3} className='w-4.5 h-4.5' />
       </button>
       </div> 

       </div>
      
  ) :(
    <div><Loading /></div>
  )
}


export default SeatLayout