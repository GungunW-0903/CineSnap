import React,{ useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { StarIcon,Heart, PlayCircleIcon, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import ReviewsSection from '../components/ReviewsSection'
import TrailerModal from '../components/TrailerModal'
import useFavorites from '../hooks/useFavorites'
import useWatchlist from '../hooks/useWatchlist'
import { fetchMovieById, fetchShowsForMovie, fetchMovies } from '../lib/api'
import { BellRing, Bell } from 'lucide-react'
const MovieDetails = () => {
  const {id} =useParams()
  const location = useLocation()
  const[show,setShow]=useState(null)
  const[showTrailer,setShowTrailer]=useState(false)
  const[catalogue,setCatalogue]=useState([])
  const dateSelectRef = useRef(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isWatched, toggleWatch } = useWatchlist()
  const navigate=useNavigate()

  const getShow= async()=>{
    // Live movie + showtimes, with graceful fallback baked into the api layer.
    const [movie, dateTime] = await Promise.all([
      fetchMovieById(id),
      fetchShowsForMovie(id),
    ])
    if (movie) {
      setShow({ movie, dateTime })
    }
  }
  useEffect(()=>{
    getShow();
    // Pull the full catalogue once so we can suggest similar titles.
    fetchMovies().then((data) => Array.isArray(data) && setCatalogue(data))
  },[id])

  // If the user arrived via a "Book" button, scroll them straight to the
  // date/showtime picker once the movie (and its showtimes) have loaded.
  useEffect(() => {
    if (!show || show.movie.status === 'coming_soon') return
    if (!location.state?.scrollToBooking) return
    const t = setTimeout(() => {
      dateSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
    return () => clearTimeout(t)
  }, [show, location.state])

  // "You may also like" — same-genre titles first, then fill with popular ones.
  const recommendations = useMemo(() => {
    if (!show?.movie) return []
    const source = catalogue.length ? catalogue : dummyShowsData
    const currentId = String(show.movie._id)
    const myGenres = new Set((show.movie.genres || []).map((g) => g.name))
    const others = source.filter((m) => String(m._id) !== currentId && m.status !== 'coming_soon')
    const scored = others
      .map((m) => ({
        movie: m,
        overlap: (m.genres || []).filter((g) => myGenres.has(g.name)).length,
      }))
      .sort((a, b) => b.overlap - a.overlap || (b.movie.vote_average || 0) - (a.movie.vote_average || 0))
    return scored.slice(0, 4).map((s) => s.movie)
  }, [show, catalogue])

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: show.movie.title,
      text: `Check out ${show.movie.title} on CineSnap!`,
      url,
    }
    // Native share sheet on mobile; clipboard fallback on desktop.
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* user dismissed the share sheet — nothing to do */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Could not copy the link')
    }
  }
  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
<div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
  <img src={show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-80 md:h-104 max-w-56 md:max-w-70 object-cover shrink-0' />
  <div className='relative flex flex-col gap-3 max-md:items-center max-md:text-center'>
    <BlurCircle top='0px' left='-100px' />
    <p className='text-[#f84565] '>ENGLISH</p>
    <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
    <div className='flex items-center gap-1 text-gray-300'>
      <StarIcon className='h-5 w-5 text-[#f84565] fill-[#f84565]' />
      {Number(show.movie.vote_average || 0).toFixed(1)} User Rating
    </div>
    <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
    <p>{timeFormat(show.movie.runtime)} •  {(show.movie.genres || []).map(genre => genre.name).join(", ")}  •  {new Date(show.movie.release_date).getFullYear()}</p>

    <div className='flex flex-wrap items-center gap-3 md:gap-4 mt-4 max-md:justify-center'>
      <button
        onClick={() => setShowTrailer(true)}
        disabled={!show.movie.trailer_url}
        className='flex items-center gap-1 px-5 md:px-7 py-3 text-sm bg-gray-400 hover:bg-gray-900 transition rounded-md font medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
        <PlayCircleIcon className='w-3 h-3'/>
        Watch Trailer</button>
      {show.movie.status === 'coming_soon' ? (
        <button
          onClick={() => {
            const added = toggleWatch(show.movie)
            toast.success(added ? `We'll remind you about ${show.movie.title} 🔔` : 'Reminder removed')
          }}
          className={`flex items-center gap-2 px-6 md:px-10 py-3 text-sm transition rounded-md font-medium cursor-pointer ${isWatched(show.movie._id) ? 'bg-[#ffc24a]/15 text-[#ffd27a] border border-[#ffc24a]/40' : 'bg-[#f84565] hover:bg-[#D63854]'}`}>
          {isWatched(show.movie._id) ? <BellRing className='w-4 h-4' /> : <Bell className='w-4 h-4' />}
          {isWatched(show.movie._id) ? "You'll be notified" : 'Notify me'}
        </button>
      ) : (
        <a href="#dateSelect" className='px-6 md:px-10 py-3 text-sm bg-[#f84565] hover:bg-[#D63854] transition rounded-md font-medium cursor-pointer'>Buy Tickets</a>
      )}
      <button
        onClick={() => {
          const added = toggleFavorite(show.movie)
          toast.success(added ? 'Added to favorites' : 'Removed from favorites')
        }}
        aria-label={isFavorite(show.movie._id) ? 'Remove from favorites' : 'Add to favorites'}
        className={`p-2.5 rounded-full transition cursor-pointer ${isFavorite(show.movie._id) ? 'bg-[#f84565]/20 text-[#f84565]' : 'bg-gray-700 text-white'}`}>
        <Heart className='w-5 h-5' fill={isFavorite(show.movie._id) ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={handleShare}
        aria-label='Share this movie'
        className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer hover:bg-gray-600'>
        <Share2 className='w-5 h-5' />
      </button>
    </div>
  </div>
</div>
{Array.isArray(show.movie.casts) && show.movie.casts.length > 0 && (
  <>
    <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
    <div className='overflow-x-auto scrollwidth-none mt-8 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div className='flex items-center gap-4 w-max px-4 mt-4'>
        {show.movie.casts.slice(0,9).map((cast,index)=>(
          <div key={index} className='flex flex-col items-center '>
            <img src={cast.profile_path} alt=""  className='rounded-full h20 md:h-20 aspect-square object-cover'/>
            <p className='font-medium text-xs mt-3'>{cast.name}</p>
          </div>
        ))}
      </div>
    </div>
  </>
)}
{show.movie.status !== 'coming_soon' && (
  <div ref={dateSelectRef}>
    <DateSelect dateTime={show.dateTime} id={id}/>
  </div>
)}

<ReviewsSection movieId={id} />

{recommendations.length > 0 && (
  <>
    <p className='text-lg font-medium mt-20 mb-8'>You may also Like</p>
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {recommendations.map((movie)=>(
              <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  </>
)}
<div className='flex justify-center mt-20'>
  <button onClick={()=>{navigate('/movies');scrollTo(0,0);}} className='bg-[#f84565] text-medium font-medium px-6 md:px-16 py-3 rounded hover:bg-[#D63854] transition cursor-pointer
  '>Show more</button>

</div>

{showTrailer && (
  <TrailerModal
    url={show.movie.trailer_url}
    title={show.movie.title}
    onClose={() => setShowTrailer(false)}
  />
)}

    </div>
  ) :(
    <div><Loading /></div>
  )
}

export default MovieDetails