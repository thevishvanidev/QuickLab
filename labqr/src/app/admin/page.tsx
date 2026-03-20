'use client'
import { useEffect, useState } from 'react'

type Item = { test: { name: string; price: number } }
type Booking = {
  id: string; patientName: string; phone: string; address: string
  date: string; time: string; status: string; paymentMode: string
  totalAmount: number; technicianName: string | null; reportLink: string | null
  createdAt: string; items: Item[]; lab: { name: string }
}

const STATUSES = ['All','Pending','Assigned','Collected','ReportReady','Completed']
const STATUS_COLOR: Record<string, string> = {
  Pending:     'bg-yellow-100 text-yellow-700',
  Assigned:    'bg-blue-100 text-blue-700',
  Collected:   'bg-purple-100 text-purple-700',
  ReportReady: 'bg-green-100 text-green-700',
  Completed:   'bg-gray-100 text-gray-500',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter,   setFilter]   = useState('All')
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({ status: '', technicianName: '', reportLink: '' })

  const load = async (status: string) => {
    setLoading(true)
    const qs  = status !== 'All' ? `?status=${status}` : ''
    const res = await fetch(`/api/admin/bookings${qs}`)
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(() => { load(filter) }, [filter])

  const openEdit = (b: Booking) => {
    setSelected(b)
    setForm({ status: b.status, technicianName: b.technicianName || '', reportLink: b.reportLink || '' })
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/booking/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSelected(null)
    load(filter)
  }

  const allBookings = bookings
  const counts = ['Pending','Assigned','Collected','ReportReady','Completed'].reduce((acc, s) => {
    acc[s] = allBookings.filter(b => b.status === s).length; return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <button onClick={() => load(filter)} className="text-sm text-blue-600 font-medium hover:underline">↻ Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {['Pending','Assigned','Collected','ReportReady','Completed'].map(s => (
          <div key={s} onClick={() => setFilter(s)}
            className="card p-4 text-center cursor-pointer hover:border-blue-300 transition">
            <p className="text-2xl font-bold text-gray-800">{counts[s] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">{s}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
              ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No bookings found for this filter.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-gray-800">{b.patientName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                  <span className="text-xs text-gray-400">#{b.id.slice(-6).toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-500">📞 {b.phone} · 📅 {b.date} {b.time}</p>
                <p className="text-sm text-gray-400 truncate">📍 {b.address}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {b.items.map((item, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{item.test.name}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-blue-700 text-lg">₹{b.totalAmount}</p>
                <p className="text-xs text-gray-400 mb-2">{b.paymentMode}</p>
                {b.technicianName && <p className="text-xs text-gray-500 mb-2">👨‍⚕️ {b.technicianName}</p>}
                <button onClick={() => openEdit(b)} className="btn-outline text-sm px-4 py-2">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1">{selected.patientName}</h2>
            <p className="text-sm text-gray-400 mb-5">#{selected.id.slice(-8).toUpperCase()} · {selected.date} {selected.time}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['Pending','Assigned','Collected','ReportReady','Completed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Technician Name</label>
                <input className="input" placeholder="e.g. Ravi Kumar"
                  value={form.technicianName} onChange={e => setForm(p => ({ ...p, technicianName: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Report Link (URL)</label>
                <input className="input" placeholder="https://drive.google.com/..."
                  value={form.reportLink} onChange={e => setForm(p => ({ ...p, reportLink: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
