'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

type BookingItem = { test: { name: string; price: number } }
type Booking = {
  id: string; patientName: string; phone: string; address: string
  date: string; time: string; status: string; paymentMode: string
  totalAmount: number; technicianName: string | null; reportLink: string | null
  items: BookingItem[]; lab: { name: string; phone: string }
}

const STEPS = ['Pending','Assigned','Collected','ReportReady'] as const
type Step = typeof STEPS[number]

const STEP_META: Record<Step, { label: string; icon: string; msg: string }> = {
  Pending:     { label: 'Pending',          icon: '🕐', msg: 'Booking received. Technician will be assigned shortly.' },
  Assigned:    { label: 'Tech Assigned',    icon: '👨‍⚕️', msg: 'Technician assigned and will visit at your scheduled time.' },
  Collected:   { label: 'Sample Collected', icon: '🧪', msg: 'Sample collected successfully. Report is being processed.' },
  ReportReady: { label: 'Report Ready',     icon: '📄', msg: 'Your report is ready! View it using the link below.' },
}

export default function TrackPage() {
  const { labId }      = useParams<{ labId: string }>()
  const searchParams   = useSearchParams()
  const router         = useRouter()
  const [phone, setPhone]       = useState(searchParams.get('phone') || '')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState('')

  const fetchBookings = async (ph: string) => {
    setLoading(true); setError(''); setSearched(true)
    try {
      const res  = await fetch(`/api/booking?phone=${encodeURIComponent(ph)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBookings(data.bookings)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const ph = searchParams.get('phone')
    if (ph) fetchBookings(ph)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (phone.trim().length < 10) { setError('Enter a valid 10-digit number'); return }
    fetchBookings(phone.trim())
  }

  return (
    <div className="max-w-lg mx-auto pb-12">
      <div className="bg-blue-600 text-white px-6 py-5 flex items-center gap-3">
        <button onClick={() => router.push(`/lab/${labId}`)} className="text-white/80 text-xl leading-none">←</button>
        <h1 className="text-lg font-bold">Track My Booking</h1>
      </div>

      <div className="px-4 pt-6">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-3 font-medium">Enter the phone number used during booking</p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              maxLength={10}
              onChange={e => { setPhone(e.target.value); setSearched(false) }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-primary shrink-0 px-5">
              {loading ? '…' : 'Track'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center pt-16">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && (
        <div className="px-4 pt-5 space-y-5">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🔍</div>
              <h2 className="text-gray-700 font-semibold text-lg">No bookings found</h2>
              <p className="text-gray-400 text-sm mt-1">Double-check the phone number used during booking.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 font-medium">{bookings.length} booking{bookings.length > 1 ? 's' : ''} found</p>
              {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const stepIdx = Math.max(0, STEPS.indexOf(booking.status as Step))
  const meta    = STEP_META[booking.status as Step] ?? STEP_META.Pending
  const [expanded, setExpanded] = useState(true)

  const msgColor =
    booking.status === 'ReportReady' ? 'bg-green-50 text-green-700' :
    booking.status === 'Collected'   ? 'bg-purple-50 text-purple-700' :
    booking.status === 'Assigned'    ? 'bg-blue-50 text-blue-700' :
                                       'bg-yellow-50 text-yellow-700'

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex justify-between">
        <div>
          <p className="text-white/70 text-xs">Booking ID</p>
          <p className="text-white font-mono font-bold tracking-widest">#{booking.id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs">{booking.lab.name}</p>
          <p className="text-white text-xs font-medium">{booking.date} · {booking.time}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Timeline */}
        <div>
          <div className="flex items-start mb-3">
            {STEPS.map((s, i) => {
              const done   = i <= stepIdx
              const active = i === stepIdx
              const m      = STEP_META[s]
              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && <div className={`flex-1 h-1 rounded-full ${i <= stepIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border-2 transition-all
                      ${active ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-200 scale-110' : done ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-gray-100'}`}>
                      {done && !active ? <span className="text-white text-xs font-bold">✓</span> : <span>{m.icon}</span>}
                    </div>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-1 rounded-full ${i < stepIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />}
                  </div>
                  <p className={`text-center mt-1.5 text-[10px] font-medium leading-tight px-1
                    ${active ? 'text-blue-600' : done ? 'text-blue-400' : 'text-gray-300'}`}
                    style={{ maxWidth: 56 }}>
                    {m.label}
                  </p>
                </div>
              )
            })}
          </div>

          <div className={`rounded-xl px-4 py-3 text-sm font-medium flex gap-2 items-start ${msgColor}`}>
            <span className="text-base shrink-0">{meta.icon}</span>
            <span>{meta.msg}</span>
          </div>
        </div>

        {booking.technicianName && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-2xl">👨‍⚕️</span>
            <div>
              <p className="text-xs text-gray-400">Assigned Technician</p>
              <p className="font-semibold text-gray-700">{booking.technicianName}</p>
            </div>
          </div>
        )}

        {booking.reportLink && (
          <a href={booking.reportLink} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-xs text-green-500">Report Available</p>
              <p className="font-semibold text-green-700 text-sm">View / Download Report →</p>
            </div>
          </a>
        )}

        <button onClick={() => setExpanded(p => !p)} className="text-sm text-blue-600 font-medium w-full text-center py-1">
          {expanded ? '▲ Hide details' : '▼ Show details'}
        </button>

        {expanded && (
          <div className="border-t pt-3 space-y-3">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Tests Booked</p>
              {booking.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{item.test.name}</span>
                  <span className="text-blue-700 font-semibold">₹{item.test.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm pt-2">
                <span className="text-gray-600">Total</span>
                <span className="text-blue-700">₹{booking.totalAmount}</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              {[['Patient', booking.patientName],['Address', booking.address],['Payment', booking.paymentMode]].map(([l,v]) => (
                <div key={l} className="flex gap-3">
                  <span className="text-gray-400 w-16 shrink-0">{l}</span>
                  <span className="text-gray-600 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <a href={`tel:${booking.lab.phone}`} className="flex items-center gap-2 text-sm text-blue-600 font-medium pt-1">
              📞 Call {booking.lab.name}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
