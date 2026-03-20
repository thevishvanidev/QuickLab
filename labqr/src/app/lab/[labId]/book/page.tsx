'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useParams, useRouter } from 'next/navigation'

const TIME_SLOTS = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']

export default function BookPage() {
  const { labId } = useParams<{ labId: string }>()
  const { items, total, clear } = useCart()
  const router = useRouter()

  const [form, setForm]       = useState({ name: '', phone: '', address: '', date: '', time: '' })
  const [payMode, setPayMode] = useState<'Cash' | 'Online'>('Cash')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address || !form.date || !form.time) {
      setError('Please fill in all fields and select a time slot.'); return
    }
    if (form.phone.length < 10) { setError('Enter a valid 10-digit phone number.'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId,
          patientName: form.name,
          phone: form.phone,
          address: form.address,
          date: form.date,
          time: form.time,
          paymentMode: payMode,
          testIds: items.map(i => i.id),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      clear()
      router.push(`/lab/${labId}/confirm/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto p-6 text-center pt-20">
      <div className="text-5xl mb-4">🛒</div>
      <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
      <p className="text-gray-400 mt-2">Go back and add some tests first.</p>
      <button onClick={() => router.back()} className="btn-primary mt-6 w-full">← Browse Tests</button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto pb-10">
      <div className="bg-blue-600 text-white px-6 py-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/80 text-xl leading-none">←</button>
        <h1 className="text-lg font-bold">Book Home Collection</h1>
      </div>

      <div className="px-4 pt-6 space-y-5">
        {/* Cart summary */}
        <div className="card p-4">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Selected Tests</h2>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{i.name}</span>
              <span className="font-semibold text-blue-700">₹{i.price}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-3 mt-1">
            <span>Total</span>
            <span className="text-blue-700">₹{total}</span>
          </div>
        </div>

        {/* Patient details */}
        <div className="card p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Patient Details</h2>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Full Name *</label>
            <input className="input" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Phone Number *</label>
            <input className="input" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Collection Address *</label>
            <textarea className="input resize-none" rows={3} placeholder="House no., Street, Area, City" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Schedule</h2>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Date *</label>
            <input className="input" type="date" min={minDate} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-2">Time Slot *</label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  onClick={() => set('time', t)}
                  className={`py-2 rounded-xl text-sm font-medium border transition
                    ${form.time === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Payment Method</h2>
          {(['Cash', 'Online'] as const).map(m => (
            <button
              key={m}
              onClick={() => setPayMode(m)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left
                ${payMode === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <span className="text-2xl">{m === 'Cash' ? '💵' : '💳'}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{m === 'Cash' ? 'Cash on Collection' : 'Pay Online'}</p>
                <p className="text-xs text-gray-400">{m === 'Cash' ? 'Pay when technician arrives' : 'Pay now via UPI / Card'}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${payMode === m ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                {payMode === m && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? 'Confirming…' : `Confirm Booking · ₹${total}`}
        </button>
      </div>
    </div>
  )
}
