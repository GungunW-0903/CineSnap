import React, { Suspense, lazy } from 'react'
import HeroSection from '../components/HeroSection'
import ExperienceHighlights from '../components/ExperienceHighlights'
import StatsSection from '../components/StatsSection'
import FeaturedSection from '../components/FeaturedSection'
import TrendingSection from '../components/TrendingSection'
import Timeline from '../components/Timeline'

// Below-the-fold + heavy sections are code-split so the initial payload
// (and the hls/dash players bundled by react-player) stay off the critical path.
const TrailerSection = lazy(() => import('../components/TrailerSection'))
const Testimonials = lazy(() => import('../components/Testimonials'))
const FAQ = lazy(() => import('../components/FAQ'))

const SectionFallback = () => (
  <div className="section-shell py-16">
    <div className="h-48 w-full animate-pulse rounded-3xl border border-white/10 bg-white/5" />
  </div>
)

/**
 * Home — the storytelling landing flow:
 * Hook (hero) → social proof (trusted) → value (features) → scale (stats)
 * → product (now showing) → how it works → experience (trailers)
 * → emotion (testimonials) → objection handling (FAQ).
 */
const Home = () => {
  return (
    <>
      <HeroSection />
      <ExperienceHighlights />
      <StatsSection />
      <FeaturedSection />
      <TrendingSection />
      <Timeline />
      <Suspense fallback={<SectionFallback />}>
        <TrailerSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FAQ />
      </Suspense>
    </>
  )
}

export default Home
