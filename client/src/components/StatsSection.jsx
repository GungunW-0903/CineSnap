import React from 'react'
import { Building2, Ticket, Smile, Clapperboard } from 'lucide-react'
import AnimatedCounter from './ui/AnimatedCounter'
import { StaggerGroup, StaggerItem } from './ui/Reveal'

const stats = [
  { icon: Ticket, value: 1.2, decimals: 1, suffix: 'M+', label: 'Tickets Booked', color: '#ff7a55' },
  { icon: Building2, value: 120, suffix: '+', label: 'Partner Theaters', color: '#ffc24a' },
  { icon: Smile, value: 98, suffix: '%', label: 'Happy Moviegoers', color: '#7ee0c0' },
  { icon: Clapperboard, value: 4500, suffix: '+', label: 'Shows Streamed Weekly', color: '#9db4ff' },
]

const StatsSection = () => {
  return (
    <section className="relative section-shell py-12 md:py-16">
      <div className="cs-gradient-border overflow-hidden p-[1px]">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#0c1322]/80 p-8 md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[#ff6d4d]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-[#ffc24a]/12 blur-3xl" />

          <StaggerGroup className="relative grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <StaggerItem key={s.label} className="group text-center md:text-left">
                  <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-transform duration-300 group-hover:scale-110 md:mx-0"
                    style={{ color: s.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="display-font text-4xl md:text-5xl" style={{ color: '#fff' }}>
                    <AnimatedCounter
                      value={s.value}
                      decimals={s.decimals || 0}
                      suffix={s.suffix}
                    />
                  </p>
                  <p className="mt-2 text-sm text-gray-400">{s.label}</p>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </div>
    </section>
  )
}

export default StatsSection
