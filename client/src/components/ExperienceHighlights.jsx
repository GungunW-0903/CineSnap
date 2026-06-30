import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Users, TrendingUp, Star, Building2 } from 'lucide-react'
import Reveal, { StaggerGroup, StaggerItem } from './ui/Reveal'
import TiltCard from './ui/TiltCard'
import MagneticButton from './ui/MagneticButton'

const featureCards = [
  {
    title: 'Instant seat lock',
    text: 'Reserve your favorite seats in a tap — held for you while high-demand shows sell out.',
    icon: ShieldCheck,
  },
  {
    title: 'Smart discovery',
    text: 'Surface trending picks by genre, rating, and release momentum in seconds.',
    icon: Zap,
  },
  {
    title: 'Built for groups',
    text: 'Plan friend and family movie nights with adjacent seats and one shared checkout.',
    icon: Users,
  },
]

const trustMetrics = [
  { value: '120+', label: 'Partner Theaters', icon: Building2 },
  { value: '1.2M', label: 'Tickets Booked', icon: TrendingUp },
  { value: '4.9/5', label: 'User Satisfaction', icon: Star },
]

const ExperienceHighlights = () => {
  const navigate = useNavigate()

  return (
    <section className="section-shell py-12 md:py-16">
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#0d1424]/70 p-6 md:p-10">
        <div className="cs-grid-overlay pointer-events-none absolute inset-0 opacity-60" />
        <span className="cs-aurora absolute -right-8 -top-16 h-60 w-60 bg-[#ff6d4d]/16" />

        <div className="relative z-10">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f4b98d]">Experience Upgrade</p>
          </Reveal>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <Reveal delay={0.05}>
              <h2 className="text-4xl md:text-5xl">Why movie lovers choose CineSnap</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <MagneticButton
                onClick={() => {
                  navigate('/movies')
                  scrollTo(0, 0)
                }}
              >
                Start Exploring
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </Reveal>
          </div>

          <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <StaggerItem key={feature.title} className="h-full">
                  <TiltCard max={9} className="h-full">
                    <article className="group h-full rounded-2xl border border-white/12 bg-black/25 p-5 transition-colors duration-300 hover:border-[#ffc24a]/30">
                      <motion.div
                        whileHover={{ rotate: -8, scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff5a3d]/18 text-[#ffcf8b]"
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <h3 className="mt-4 text-2xl">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">{feature.text}</p>
                    </article>
                  </TiltCard>
                </StaggerItem>
              )
            })}
          </StaggerGroup>

          <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {trustMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <StaggerItem key={metric.label}>
                  <div className="rounded-2xl border border-[#ffb15e]/25 bg-[#ffb15e]/10 px-4 py-4 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb15e]/25 text-[#ffd694]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-2xl leading-none md:text-3xl">{metric.value}</p>
                        <p className="mt-1 text-xs text-[#ffd6a7]">{metric.label}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </div>
    </section>
  )
}

export default ExperienceHighlights
