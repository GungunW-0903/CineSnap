import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartCrack, Trash2 } from 'lucide-react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { StaggerGroup, StaggerItem } from '../components/ui/Reveal'
import useFavorites from '../hooks/useFavorites'

const Favorite = () => {
  const navigate = useNavigate()
  const { favorites, clearFavorites, count } = useFavorites()

  return (
    <section className="relative section-shell overflow-hidden pt-34 md:pt-38 pb-24 min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex flex-wrap items-end justify-between gap-4 reveal-up">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#f4b98d]">Saved picks</p>
          <h1 className="mt-2 text-4xl md:text-6xl">Your favorite movies</h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
            {count > 0
              ? `You've saved ${count} film${count === 1 ? '' : 's'}. Jump back into booking whenever you're ready.`
              : 'Tap the heart on any movie to keep it here for later.'}
          </p>
        </div>
        {count > 0 && (
          <button
            onClick={clearFavorites}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-gray-200 transition hover:border-[#ff5a3d]/40 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {count > 0 ? (
        <StaggerGroup
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}
        >
          {favorites.map((movie, i) => (
            <StaggerItem key={movie._id} layout>
              <MovieCard movie={movie} index={i} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-500">
            <HeartCrack className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl text-white">No favorites yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Browse the library and tap the heart on movies you love — they'll show up here.
          </p>
          <button onClick={() => navigate('/movies')} className="btn-cinesnap mt-6 px-6">
            Explore movies
          </button>
        </motion.div>
      )}
    </section>
  )
}

export default Favorite
