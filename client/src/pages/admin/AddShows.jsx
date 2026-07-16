import React, {useState,useEffect} from 'react'
import { dummyShowsData } from '../../assets/assets';
import Loading from '../../components/Loading';
import { StarIcon } from 'lucide-react';
import Title from '../../components/Admin/Title';
const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const [nowPlayingMovie, setNowPlayingMovies] =useState([]);
  const [selectedMovie,setSelectedMovie] = useState(null)
  const [dateTimeSelection,setDateTimeSelection] =useState({});
  const [dateTimeInput,setDateTimeInput] =useState(" ");
  const [showPrice, setShowPrice] = useState(" ");


  const fetchNowPlayingMovies = async () =>{
    setNowPlayingMovies(dummyShowsData)
  };

  useEffect(() =>{
    fetchNowPlayingMovies();
  },[])
 
  return nowPlayingMovie.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className='mt-10 font-medium text-lg'>Now Playing Movies</p>
      <div className="overflow-x-auto pb-4">
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
               {nowPlayingMovie.slice(0,5).map((movie)=>(
                    <div key={movie.id} className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition-duration-300 `}>
                      <div className='rounded-lg overflow-hidden'>
                       <img src={movie.poster_path} className='w-full object-cover brightness-90' alt="" />
                       <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full '>
                              <p className='flex items-center gap-2'> <StarIcon className="w-4 h-4 text-[#f84565] fill-[#f84565]" />
                               {movie.vote_average.toFixed(1)}
                               </p>


                            <p className='Text-gray-300'>{movie.vote_count}  Votes</p>



                       </div>

                      </div>
                    </div>

               ))}
        </div>
      </div>
    </>
  ) : (
    <Loading />
  )
}

export default AddShows