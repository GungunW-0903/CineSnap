import React,{ useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyShowsData,dummyDateTimeData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { StarIcon,Heart, PlayCircleIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
const MovieDetails = () => {
  const {id} =useParams()
  const[show,setShow]=useState(null)
  const navigate=useNavigate()

  const getShow= async()=>{
    const show=dummyShowsData.find(show=>show._id===id)
    if(show){
    setShow({
      movie:show,
      dateTime: dummyDateTimeData
    })
  }
}
  useEffect(()=>{
    getShow();
  },[id])
  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
<div className='flex gap-8 max-w-6xl mx-auto'>
  <img src={show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />
  <div className='relative flex flex-col gap-3'>
    <BlurCircle top='0px' left='-100px' />
    <p className='text-[#f84565] '>ENGLISH</p>
    <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
    <div className='flex items-center gap-1 text-gray-300'>
      <StarIcon className='h-5 w-5 text-[#f84565] fill-[#f84565]' />
      {show.movie.vote_average.toFixed(1)} User Rating
    </div>
    <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
    <p>{timeFormat(show.movie.runtime)} •  {show.movie.genres.map(genre => genre.name).join(", ")}  •  {new Date(show.movie.release_date).getFullYear()}</p>

    <div className='flex items-center gap-4 mt-4'>
      <button className='flex items-center gap-1 px-7 py-3 text-sm bg-gray-400 hover:bg-gray-900 transition rounded-md font medium cursor-pointer'>
        <PlayCircleIcon className='w-3 h-3'/>
        Watch Trailer</button>
      <a href="#dateSelect" className='px-10 py-3 text-sm bg-[#f84565] hover:bg-[#D63854] transition rounded-md font-medium cursor-pointer'>Buy Tickets</a>
      <button className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer'>
        <Heart className='w-5 h-5' />
      </button>
    </div>
  </div>
</div>
<p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
<div className='overflow scrollwidth-none mt-8 pb-4'>
<div className='flex items-center gap-4 w-max px-4 mt-4'>
  {show.movie.casts.slice(0,9).map((cast,index)=>(
    <div key={index} className='flex flex-col items-center '>
       <img src={cast.profile_path} alt=""  className='rounded-full h20 md:h-20 aspect-square object-cover'/>
       <p className='font-medium text-xs mt-3'>{cast.name}</p>
    </div>

  ))}
</div>
</div>
<DateSelect dateTime={show.dateTime} id={id}/>

<p className='text-lg font-medium mt-20 mb-8'>You may also Like</p>
<div className='flex justify-center gap-8'>
  {dummyShowsData.slice(0,4).map((movie,index)=>(
          <MovieCard key={index} movie={movie} />
  ))}
</div>
<div className='flex justify-center mt-20'>
  <button onClick={()=>{navigate('/movies');scrollTo(0,0);}} className='bg-[#f84565] text-medium font-medium px-6 md:px-16 py-3 rounded hover:bg-[#D63854] transition cursor-pointer
  '>Show more</button>

</div>


    </div>
  ) :(
    <div><Loading /></div>
  )
}

export default MovieDetails