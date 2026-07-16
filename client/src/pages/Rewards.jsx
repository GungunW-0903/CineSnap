import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Crown, Gift, Ticket, Wallet, Copy, Share2, Star } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { useProfile, tierInfo, TIERS } from '../context/ProfileContext'

const currency = import.meta.env.VITE_CURRENCY || '₹'

const StatCard = ({ icon: Icon, label, value }) => (
  <div className='flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-4'>
    <div className='h-10 w-10 rounded-xl bg-[#f84565]/15 flex items-center justify-center'>
      <Icon className='w-5 h-5 text-[#f84565]' />
    </div>
    <div>
      <p className='text-xs text-gray-400'>{label}</p>
      <p className='text-lg font-semibold'>{value}</p>
    </div>
  </div>
)

const Rewards = () => {
  const { profile, loading } = useProfile()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  if (loading) return <Loading />

  if (!profile) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6'>
        <Crown className='w-10 h-10 text-[#ffc24a]' />
        <p className='text-gray-300'>Your rewards will appear here after your first booking.</p>
        <button onClick={() => navigate('/movies')} className='btn-cinesnap px-6 py-2.5'>Browse movies</button>
      </div>
    )
  }

  const points = profile.loyaltyPoints || 0
  const { current, next, progress, toNext } = tierInfo(points)
  const referral = profile.referralCode || '—'
  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL || '/'}?ref=${referral}`

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — ' + shareUrl)
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CineSnap', text: 'Book movies with me on CineSnap and we both earn points!', url: shareUrl })
      } catch { /* cancelled */ }
    } else {
      copyReferral()
    }
  }

  return (
    <div className='relative px-6 md:px-16 lg:px-40 pt-32 md:pt-40 pb-20 min-h-[85vh]'>
      <BlurCircle top='80px' left='0px' />
      <BlurCircle bottom='0px' right='60px' />

      <h1 className='text-2xl font-semibold mb-8'>Rewards</h1>

      {/* Tier card */}
      <div className='relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 bg-linear-to-br from-[#121829] to-[#0d1320] max-w-3xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-2xl flex items-center justify-center' style={{ background: `${current.color}22` }}>
              <Crown className='w-6 h-6' style={{ color: current.color }} />
            </div>
            <div>
              <p className='text-sm text-gray-400'>Your tier</p>
              <p className='text-2xl font-bold' style={{ color: current.color }}>{current.name}</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-400'>Points</p>
            <p className='text-3xl font-bold text-[#ffc24a]'>{points.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className='mt-7'>
          <div className='flex justify-between text-xs text-gray-400 mb-2'>
            <span>{current.name}</span>
            <span>{next ? next.name : 'Max tier reached 🎉'}</span>
          </div>
          <div className='h-2.5 rounded-full bg-white/10 overflow-hidden'>
            <div
              className='h-full rounded-full transition-all duration-700'
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${current.color}, #ffc24a)` }}
            />
          </div>
          {next && (
            <p className='text-xs text-gray-400 mt-2'>
              Earn <span className='text-white font-semibold'>{toNext.toLocaleString()}</span> more points to reach {next.name}.
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 max-w-3xl'>
        <StatCard icon={Ticket} label='Total bookings' value={profile.totalBookings || 0} />
        <StatCard icon={Wallet} label='Total spent' value={`${currency}${(profile.totalSpent || 0).toFixed(2)}`} />
        <StatCard icon={Star} label='Points balance' value={points.toLocaleString()} />
      </div>

      {/* Referral */}
      <div className='mt-8 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6'>
        <div className='flex items-center gap-2 mb-2'>
          <Gift className='w-5 h-5 text-[#f84565]' />
          <p className='font-semibold'>Invite friends, earn together</p>
        </div>
        <p className='text-sm text-gray-400 mb-4'>
          Share your link. When a friend joins, <span className='text-white'>you get 200 points</span> and they get 100 to start.
        </p>

        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='flex-1 flex items-center justify-between gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-3'>
            <span className='text-sm text-gray-300 truncate'>{shareUrl}</span>
            <span className='text-xs font-mono text-[#ffc24a] shrink-0'>{referral}</span>
          </div>
          <div className='flex gap-2'>
            <button onClick={copyReferral} className='flex items-center gap-2 px-4 py-3 rounded-xl border border-white/15 hover:border-white/35 transition cursor-pointer text-sm'>
              <Copy className='w-4 h-4' /> {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={share} className='flex items-center gap-2 px-4 py-3 rounded-xl bg-linear-to-r from-[#f84565] to-[#ffc24a] text-white font-medium cursor-pointer text-sm'>
              <Share2 className='w-4 h-4' /> Share
            </button>
          </div>
        </div>
      </div>

      {/* How tiers work */}
      <div className='mt-8 max-w-3xl'>
        <p className='text-sm font-semibold text-gray-300 mb-3'>How tiers work</p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {TIERS.map((t) => (
            <div key={t.name} className={`rounded-2xl border p-4 ${current.name === t.name ? 'border-white/40 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
              <Crown className='w-5 h-5 mb-2' style={{ color: t.color }} />
              <p className='font-semibold' style={{ color: t.color }}>{t.name}</p>
              <p className='text-xs text-gray-400 mt-1'>{t.min.toLocaleString()}+ pts</p>
            </div>
          ))}
        </div>
        <p className='text-xs text-gray-500 mt-3'>You earn 10 points for every {currency}1 spent on tickets.</p>
      </div>
    </div>
  )
}

export default Rewards
