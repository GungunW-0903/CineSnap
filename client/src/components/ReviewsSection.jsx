import React, { useEffect, useState } from 'react'
import { useAuthUser } from '../lib/authUser'
import toast from 'react-hot-toast'
import { StarIcon, ThumbsUp } from 'lucide-react'
import { fetchMovieReviews, submitReview, likeReview } from '../lib/api'

// Interactive 1–5 star selector / display.
const Stars = ({ value, onChange, size = 'w-6 h-6' }) => {
  const [hover, setHover] = useState(0)
  const interactive = typeof onChange === 'function'
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n
        return (
          <button
            key={n}
            type='button'
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange(n)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <StarIcon className={`${size} ${active ? 'text-[#ffc24a] fill-[#ffc24a]' : 'text-gray-600'}`} />
          </button>
        )
      })}
    </div>
  )
}

const ReviewsSection = ({ movieId }) => {
  const { user } = useAuthUser()
  const [data, setData] = useState({ reviews: [], count: 0, average: null })
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => setData(await fetchMovieReviews(movieId))

  useEffect(() => { if (movieId) load() }, [movieId])

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please pick a star rating'); return }
    setSubmitting(true)
    const res = await submitReview({ movieId, rating, comment: comment.trim() }, user)
    setSubmitting(false)
    if (res.ok) {
      toast.success('Thanks for your review!')
      setComment('')
      setRating(0)
      load()
    } else {
      toast.error(res.error || 'Could not submit review')
    }
  }

  const handleLike = async (id) => {
    const res = await likeReview(id, user)
    if (res.ok) {
      setData((d) => ({
        ...d,
        reviews: d.reviews.map((r) => (r._id === id ? { ...r, likes: res.likes } : r)),
      }))
    }
  }

  return (
    <div className='mt-20 max-w-3xl'>
      <div className='flex items-center justify-between'>
        <p className='text-lg font-medium'>Ratings & Reviews</p>
        {data.average != null && (
          <div className='flex items-center gap-2'>
            <StarIcon className='w-5 h-5 text-[#ffc24a] fill-[#ffc24a]' />
            <span className='font-semibold'>{data.average.toFixed(1)}</span>
            <span className='text-sm text-gray-400'>({data.count})</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      <div className='mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5'>
        <p className='text-sm text-gray-300 mb-3'>Rate this movie</p>
        <Stars value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Share your thoughts (optional)…'
          rows={3}
          maxLength={1000}
          className='mt-4 w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm outline-none resize-none placeholder:text-gray-500 focus:border-white/25'
        />
        <div className='flex justify-end mt-3'>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='btn-cinesnap px-6 py-2.5 text-sm disabled:opacity-60'
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </div>

      {/* Existing reviews */}
      <div className='mt-6 space-y-4'>
        {data.reviews.length === 0 && (
          <p className='text-sm text-gray-500'>No reviews yet — be the first!</p>
        )}
        {data.reviews.map((r) => (
          <div key={r._id} className='rounded-2xl border border-white/10 bg-white/[0.02] p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 rounded-full bg-[#f84565]/20 flex items-center justify-center text-sm font-semibold'>
                  {(r.userName || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className='text-sm font-medium'>{r.userName}</p>
                  <Stars value={r.rating} size='w-3.5 h-3.5' />
                </div>
              </div>
              <button
                onClick={() => handleLike(r._id)}
                className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer'
              >
                <ThumbsUp className='w-4 h-4' />
                {r.likes || 0}
              </button>
            </div>
            {r.comment && <p className='text-sm text-gray-300 mt-3 leading-relaxed'>{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsSection
