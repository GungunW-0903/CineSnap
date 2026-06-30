import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Reveal from './ui/Reveal'

const faqs = [
  {
    q: 'How fast can I actually book a ticket?',
    a: 'Most CineSnap users go from opening the app to a confirmed booking in under 60 seconds. Express seat-lock holds your seats while you check out so you never lose them to the crowd.',
  },
  {
    q: 'Can I book multiple seats for a group?',
    a: 'Absolutely. The visual seat map lets you select multiple adjacent seats at once, and group booking keeps everyone together with a single checkout and shared tickets.',
  },
  {
    q: 'Which theaters and formats are supported?',
    a: 'We partner with 120+ theaters spanning standard, premium, IMAX, and Dolby formats. Availability and pricing update live so you always see real showtimes.',
  },
  {
    q: 'Where do my tickets go after booking?',
    a: 'Digital tickets appear instantly in My Bookings. Just show the QR code at the door — no printing, no waiting in line.',
  },
  {
    q: 'Is there a fee to use CineSnap?',
    a: 'Browsing, discovery, trailers, and seat selection are completely free. You only pay the theater’s ticket price at checkout — no hidden booking surprises.',
  },
]

const FAQItem = ({ item, isOpen, onToggle, index }) => {
  return (
    <Reveal delay={index * 0.05}>
      <div
        className={`overflow-hidden rounded-2xl border bg-[#0d1424]/70 transition-colors duration-300 ${
          isOpen ? 'border-[#ffc24a]/35' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left cursor-pointer"
        >
          <span className="text-base font-semibold text-white md:text-lg">{item.q}</span>
          <motion.span
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
              isOpen
                ? 'border-[#ffc24a]/50 bg-[#ffc24a]/15 text-[#ffc24a]'
                : 'border-white/20 text-gray-300'
            }`}
          >
            <Plus className="h-4 w-4" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 0.97, 0.41, 1] }}
            >
              <p className="px-5 pb-5 text-sm leading-relaxed text-gray-300">{item.a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

const FAQ = () => {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative section-shell py-16 md:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[#f4b98d]">Questions, Answered</p>
        <h2 className="mt-2 text-4xl md:text-5xl">Everything you need to know</h2>
        <p className="mt-4 text-gray-300">
          Still curious? Our team is one tap away — but most answers live right here.
        </p>
      </Reveal>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {faqs.map((item, i) => (
          <FAQItem
            key={item.q}
            item={item}
            index={i}
            isOpen={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  )
}

export default FAQ
