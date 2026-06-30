import React,{useState} from 'react'
import BlurCircle from './BlurCircle'
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({dateTime,id}) => {
    const navigate=useNavigate()
    const[selected,setSelected] =useState(null)

    const onBookHandler = () => {
        if (!selected) {
            toast.error('Please select a date first')
            return
        }

        navigate(`/movies/${id}/${selected}`)
        scrollTo(0,0)
    }



  return (
    <div id='dateSelect' className='pt-30'>
        <div className='flex md:flex-row items-center justify-between gap-10 relative p-8 bg-[#f84565]/10 border border-[#f84565]/20 rounded-lg'>
            <BlurCircle top="-100px" left="0px" />
            <BlurCircle top="100px" right="0px" />
            <div>
                <p className='text-lg font-semibold'>Choose Date</p>
                <div className='flex items-center gap-6 border-[#f84565]/20 rounded-lg'>
                    <ChevronLeftIcon width={28} />
                    <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4 mt-4'>
                        {Object.keys(dateTime).map((date)=>(
                            <button onClick={()=>setSelected(date)} key={date} className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? "bg-[#f84565] text-white"  :  "border border-[#f84565]/70"}`} >
                                   <span>{new Date(date).getDate()}</span>
                                   <span>{new Date(date).toLocaleDateString("en-US",{month:"short"})}</span>
                            </button>
                        ))}
                    </span>
                    <ChevronRightIcon width={28} />
                </div>
            </div>
            <button onClick={onBookHandler} className='bg-[#f84565] hover:bg-[#f84565]/90 transition-all cursor-pointer text-white px-8 py-2 mt-6 rounded'>Book Now</button>
        </div>
    </div>
  )
}

export default DateSelect