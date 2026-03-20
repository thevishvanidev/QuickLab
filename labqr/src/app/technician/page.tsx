'use client'
import { useEffect, useState } from 'react'

type Item    = { test: { name: string } }
type Booking = {
  id: string; patientName: string; phone: string; address: string
  date: string; time: string; totalAmount: number; paymentMode: string
  items: Item[]; lab: { name: string; phone: string }
}

export default function TechnicianPage() {
  const [authed,   setAuthed]   = useState(false)
  const [pw,       setPw]       = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [logging,  setLogging]  = useState(false)
  const [checking, setChecking] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(false)
  const [marking,  setMarking]  = useState<string | null>(null)
  const [done,     setDone]     = useState<string[]>([])

  useEffect(() => {
    fetch('/api/technician/bookings')
      .then(async r => { if (r.ok) { setAuthed(true); const d = await r.json(); setBookings(d.bookings || []) } })
      .finally(() => setChecking(false))
  }, [])

  const login = async () => {
    setLogging(true); setLoginErr('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw, role: 'technician' }),
    })
    if (res.ok) { setAuthed(true); loadBookings() }
    else setLoginErr('Wrong password. Default is: tech123')
    setLogging(false)
  }

  const loadBookings = async () => {
    setLoading(true)
    const res  = await fetch('/api/technician/bookings')
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(() => { if (authed) loadBookings() }, [authed]) // eslint-disable-line react-hooks/exhaustive-deps

  const markCollected = async (id: string) => {
    setMarking(id)
    await fetch(`/api/booking/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Collected' }),
    })
    setMarking(null)
    setDone(p => [...p, id])
  }

  const logout = async () => {
    await fetch('/api/auth?role=technician', { method: 'DELETE' })
    setAuthed(false); setBookings([])
  }

  if (checking) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authed) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">👨‍⚕️</div>
          <h1 className="text-2xl font-bold text-gray-800">Technician Login</h1>
          <p className="text-gray-400 text-sm mt-1">LabQR Field App</p>
        </div>
        <input className="input mb-3" type="password" placeholder="Enter technician password"
          value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        {loginErr && <p className="text-red-500 text-sm mb-3">{loginErr}</p>}
        <button onClick={login} disabled={logging} className="btn-primary w-full">
          {logging ? 'Logging in…' : 'Login'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">Default: <code className="bg-gray-100 px-1 rounded">tech123</code></p>
      </div>
    </div>
  )

  const active = bookings.filter(b => !done.includes(b.id))

  return (
    <div className="max-w-lg mx-auto pb-12">
      <div className="bg-blue-600 text-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">My Assignments</h1>
          <p className="text-blue-100 text-xs">{active.length} pending · {done.length} done this session</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadBookings} className="text-white/70 hover:text-white text-xl">↻</button>
          <button onClick={logout} className="text-xs text-white/70 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg">Logout</button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-gray-700 font-semibold text-lg">No assignments yet</h2>
            <p className="text-gray-400 text-sm mt-1">Pull to refresh or check back later.</p>
            <button onClick={loadBookings} className="btn-outline mt-4 px-8">Refresh</button>
          </div>
        ) : (
          bookings.map(b => {
            const isDone = done.includes(b.id)
            return (
              <div key={b.id} className={`card overflow-hidden ${isDone ? 'opacity-60' : ''}`}>
                <div className="bg-blue-50 px-4 py-3 flex justify-between items-center border-b border-blue-100">
                  <div>
                    <p className="font-bold text-gray-800">{b.patientName}</p>
                    <p className="text-xs text-gray-500">#{b.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-700">{b.date}</p>
                    <p className="text-xs text-gray-500">{b.time}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 shrink-0">📍</span>
                    <span>{b.address}</span>
                  </div>
                  <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    📞 Call Patient: {b.phone}
                  </a>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Tests to Collect</p>
                    {b.items.map((item, i) => (
                      <p key={i} className="text-sm text-gray-700 py-0.5">• {item.test.name}</p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="text-gray-500">Payment: <strong>{b.paymentMode}</strong></span>
                    <span className="font-bold text-blue-700 text-base">₹{b.totalAmount}</span>
                  </div>
                  {isDone ? (
                    <div className="w-full py-3 bg-green-100 text-green-700 font-semibold rounded-2xl text-center text-sm">
                      ✅ Marked as Collected
                    </div>
                  ) : (
                    <button onClick={() => markCollected(b.id)} disabled={marking === b.id} className="btn-primary w-full">
                      {marking === b.id ? 'Updating…' : '🧪 Mark Sample Collected'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
