import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { CheckCircle2Icon, XCircleIcon, TicketCheckIcon, ScanLine, RotateCcw } from 'lucide-react'
import { verifyTicket, checkInTicket } from '../../lib/api'

const currency = import.meta.env.VITE_CURRENCY || '$'

// Extract the booking code from whatever the QR encodes (a /verify/<code> URL
// or the bare code).
function extractCode(text) {
  if (!text) return null
  const clean = text.trim().split('?')[0].split('#')[0]
  const marker = '/verify/'
  if (clean.includes(marker)) return clean.split(marker)[1].split('/')[0]
  return clean.split('/').pop()
}

const AdminScan = () => {
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // verify response
  const [checkedIn, setCheckedIn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const stop = async () => {
    const s = scannerRef.current
    if (s && s.isScanning) {
      try { await s.stop() } catch { /* already stopped */ }
    }
  }

  const handleDecoded = async (decodedText) => {
    const code = extractCode(decodedText)
    if (!code) return
    await stop()
    setScanning(false)
    setBusy(true)
    const r = await verifyTicket(code)
    setResult({ ...r, code })
    setCheckedIn(r?.ticket?.checkedIn || false)
    setBusy(false)
  }

  const start = async () => {
    setResult(null)
    setError(null)
    setCheckedIn(false)
    try {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode('qr-reader')
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleDecoded,
        () => {} // per-frame decode errors are noise — ignore
      )
      setScanning(true)
    } catch (err) {
      setError('Could not access camera. Grant permission or type the code below.')
      setScanning(false)
    }
  }

  useEffect(() => {
    return () => { stop() } // cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doCheckIn = async () => {
    if (!result?.code) return
    setBusy(true)
    const r = await checkInTicket(result.code)
    setBusy(false)
    if (r.ok) {
      setCheckedIn(true)
    } else {
      // Re-verify to reflect true state (e.g. already used).
      const v = await verifyTicket(result.code)
      setResult({ ...v, code: result.code })
      setCheckedIn(v?.ticket?.checkedIn || false)
    }
  }

  const reset = () => {
    setResult(null)
    setCheckedIn(false)
    start()
  }

  const ticket = result?.ticket
  const valid = result?.valid && !checkedIn

  return (
    <div className='max-w-lg'>
      <h1 className='text-2xl font-semibold mb-1'>Ticket Scanner</h1>
      <p className='text-sm text-gray-400 mb-6'>Scan a guest's QR code to verify and check them in.</p>

      {/* Scanner viewport */}
      {!result && (
        <div className='rounded-2xl border border-white/10 overflow-hidden bg-black/40'>
          <div id='qr-reader' className='w-full' />
          <div className='p-5 flex flex-col items-center'>
            {!scanning ? (
              <button onClick={start} className='btn-cinesnap px-6 py-2.5 flex items-center gap-2'>
                <ScanLine className='w-4 h-4' /> Start camera
              </button>
            ) : (
              <p className='text-sm text-gray-400 flex items-center gap-2'>
                <ScanLine className='w-4 h-4 animate-pulse' /> Point the camera at a ticket QR…
              </p>
            )}
            {error && <p className='text-xs text-red-400 mt-3 text-center'>{error}</p>}
          </div>
        </div>
      )}

      {busy && !result && <p className='text-sm text-gray-400 mt-4'>Verifying…</p>}

      {/* Result card */}
      {result && (
        <div className='rounded-2xl border border-white/10 overflow-hidden'>
          <div
            className='p-5 flex items-center gap-3'
            style={{ background: valid ? 'rgba(34,197,94,0.12)' : checkedIn ? 'rgba(255,194,74,0.12)' : 'rgba(239,68,68,0.12)' }}
          >
            {valid ? <CheckCircle2Icon className='w-9 h-9 text-green-400' />
              : checkedIn ? <TicketCheckIcon className='w-9 h-9 text-[#ffc24a]' />
              : <XCircleIcon className='w-9 h-9 text-red-400' />}
            <div>
              <p className='text-lg font-bold'>
                {valid ? 'Valid ticket' : checkedIn ? 'Already checked in' : 'Not valid'}
              </p>
              <p className='text-sm text-gray-300'>{checkedIn ? 'This ticket was already scanned.' : result.message}</p>
            </div>
          </div>

          {ticket && (
            <div className='p-5'>
              <p className='text-lg font-bold'>{ticket.movieTitle}</p>
              <p className='text-sm text-gray-400'>{ticket.showDate} • {ticket.showTime}</p>
              <div className='mt-3 text-sm space-y-1'>
                <div className='flex justify-between'><span className='text-gray-400'>Guest</span><span>{ticket.userName}</span></div>
                <div className='flex justify-between'><span className='text-gray-400'>Seats</span><span className='font-semibold'>{(ticket.seats||[]).join(', ')}</span></div>
                <div className='flex justify-between'><span className='text-gray-400'>Amount</span><span>{currency}{Number(ticket.totalAmount).toFixed(2)}</span></div>
                <div className='flex justify-between'><span className='text-gray-400'>Code</span><span className='font-mono'>{ticket.bookingCode}</span></div>
              </div>
            </div>
          )}

          <div className='p-5 pt-0 flex gap-3'>
            {valid && (
              <button onClick={doCheckIn} disabled={busy} className='flex-1 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold cursor-pointer disabled:opacity-60'>
                {busy ? 'Checking in…' : 'Check in ✓'}
              </button>
            )}
            <button onClick={reset} className='flex-1 py-3 rounded-full border border-white/15 hover:border-white/35 transition flex items-center justify-center gap-2 cursor-pointer'>
              <RotateCcw className='w-4 h-4' /> Scan next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminScan
