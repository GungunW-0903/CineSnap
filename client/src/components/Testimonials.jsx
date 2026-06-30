import React from 'react'
import { Star, Quote } from 'lucide-react'
import { StaggerGroup, StaggerItem } from './ui/Reveal'
import Reveal from './ui/Reveal'
import TiltCard from './ui/TiltCard'

const testimonials = [
  {
    name: 'Aarav Mehta',
    role: 'Weekend Cinephile',
    avatar: 'https://i.pravatar.cc/120?img=12',
    rating: 5,
    quote:
      'I booked four seats for a sold-out premiere in under a minute. The seat map is gorgeous and the express lock actually works.',
  },
  {
    name: 'Sofia Alvarez',
    role: 'Film Club Organizer',
    avatar: 'https://i.pravatar.cc/120?img=45',
    rating: 5,
    quote:
      'Coordinating group nights used to be chaos. CineSnap makes it feel like sending a single tap. Our club switched overnight.',
  },
  {
    name: 'Daniel Okafor',
    role: 'IMAX Enthusiast',
    avatar: 'https://i.pravatar.cc/120?img=33',
    rating: 5,
    quote:
      'The trailers, the ratings, the showtimes — everything I need is on one beautiful screen. It feels like an Apple product.',
  },
  {
    name: 'Lena Park',
    role: 'Date-Night Regular',
    avatar: 'https://i.pravatar.cc/120?img=20',
    rating: 5,
    quote:
      'Smooth, fast, and genuinely delightful to use. I look forward to booking almost as much as the movie itself.',
  },
  {
    name: 'Marcus Reid',
    role: 'Theater Partner',
    avatar: 'https://i.pravatar.cc/120?img=8',
    rating: 5,
    quote:
      'Since joining CineSnap our weekday occupancy is up double digits. The discovery feed sends us the right audience.',
  },
  {
    name: 'Priya Nair',
    role: 'Marvel Superfan',
    avatar: 'https://i.pravatar.cc/120?img=49',
    rating: 5,
    quote:
      'Front-row center for opening night, secured before my friends even opened the app. CineSnap is unfairly good.',
  },
]

const Testimonials = () => {
  return (
    <section className="relative section-shell py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="cs-aurora left-[10%] top-[20%] h-72 w-72 bg-[#ff5a3d]/18" />
        <span
          className="cs-aurora right-[8%] bottom-[6%] h-72 w-72 bg-[#ffc24a]/14"
          style={{ animationDelay: '-9s' }}
        />
      </div>

      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[#f4b98d]">Loved by Audiences</p>
        <h2 className="mt-2 text-4xl md:text-5xl">Wow moments, on repeat</h2>
        <p className="mt-4 text-gray-300">
          Real reactions from moviegoers and partners who book, plan, and pack houses with CineSnap.
        </p>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <TiltCard max={7} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0d1424]/75 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <Quote className="h-7 w-7 text-[#ff7a55]/70" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#ffc24a] text-[#ffc24a]" />
                    ))}
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-200">“{t.quote}”</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="h-11 w-11 rounded-full border border-white/15 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </article>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

export default Testimonials
