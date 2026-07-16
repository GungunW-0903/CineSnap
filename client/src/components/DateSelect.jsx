import React, { useMemo, useRef, useState } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime, id }) => {
    const navigate = useNavigate()
    const [selected, setSelected] = useState(null)
    const scrollerRef = useRef(null)
    const pillRefs = useRef({})

    // Live, sorted, future-only dates. The backend already filters past shows,
    // but sample/offline data may not — never offer a date that's already gone.
    const dates = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return Object.keys(dateTime || {})
            .filter((d) => new Date(`${d}T23:59:59`) >= today)
            .sort()
    }, [dateTime])

    // Arrows move the highlighted date one step and scroll it into view. This
    // always gives visible feedback, even when every pill already fits on screen.
    const step = (dir) => {
        if (dates.length === 0) return
        const currentIndex = selected ? dates.indexOf(selected) : -1
        let nextIndex
        if (currentIndex === -1) {
            // Nothing picked yet: right starts at the first date, left at the last.
            nextIndex = dir > 0 ? 0 : dates.length - 1
        } else {
            nextIndex = Math.min(dates.length - 1, Math.max(0, currentIndex + dir))
        }
        const nextDate = dates[nextIndex]
        setSelected(nextDate)
        const el = pillRefs.current[nextDate]
        if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }

    const onBookHandler = () => {
        if (!selected) {
            toast.error('Please select a date first')
            return
        }

        navigate(`/movies/${id}/${selected}`)
        scrollTo(0, 0)
    }

    const weekday = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
    const atStart = selected ? dates.indexOf(selected) === 0 : false
    const atEnd = selected ? dates.indexOf(selected) === dates.length - 1 : false

    return (
        <div id='dateSelect' className='pt-30'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-[#f84565]/10 border border-[#f84565]/20 rounded-lg'>
                <BlurCircle top='-100px' left='0px' />
                <BlurCircle top='100px' right='0px' />
                <div className='w-full md:flex-1 min-w-0'>
                    <p className='text-lg font-semibold'>Choose Date</p>
                    {dates.length === 0 ? (
                        <p className='text-sm text-gray-400 mt-4'>No upcoming showtimes for this movie yet — check back soon.</p>
                    ) : (
                        <div className='flex items-center gap-3 mt-4'>
                            <button
                                type='button'
                                aria-label='Previous date'
                                onClick={() => step(-1)}
                                disabled={atStart}
                                className='shrink-0 p-1.5 rounded-full border border-[#f84565]/30 hover:bg-[#f84565]/20 active:scale-90 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                            >
                                <ChevronLeftIcon width={22} />
                            </button>
                            <div
                                ref={scrollerRef}
                                className='flex gap-4 overflow-x-auto scroll-smooth py-1 md:max-w-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                            >
                                {dates.map((date) => (
                                    <button
                                        onClick={() => setSelected(date)}
                                        ref={(el) => { pillRefs.current[date] = el }}
                                        key={date}
                                        className={`flex flex-col items-center justify-center shrink-0 h-16 w-14 rounded cursor-pointer transition ${selected === date ? 'bg-[#f84565] text-white' : 'border border-[#f84565]/70 hover:bg-[#f84565]/20'}`}
                                    >
                                        <span className='text-[10px] uppercase tracking-wide opacity-80'>{weekday(date)}</span>
                                        <span className='text-base font-semibold'>{new Date(`${date}T12:00:00`).getDate()}</span>
                                        <span className='text-xs'>{new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                type='button'
                                aria-label='Next date'
                                onClick={() => step(1)}
                                disabled={atEnd}
                                className='shrink-0 p-1.5 rounded-full border border-[#f84565]/30 hover:bg-[#f84565]/20 active:scale-90 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                            >
                                <ChevronRightIcon width={22} />
                            </button>
                        </div>
                    )}
                </div>
                <button onClick={onBookHandler} className='bg-[#f84565] hover:bg-[#f84565]/90 transition-all cursor-pointer text-white px-8 py-2 mt-6 rounded'>Book Now</button>
            </div>
        </div>
    )
}

export default DateSelect
