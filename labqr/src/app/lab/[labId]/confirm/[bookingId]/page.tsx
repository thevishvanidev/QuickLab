'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Booking = {
  id: string; patientName: string; phone: string; address: string
  date: string; time: string; status: string; paymentMode: string
  totalAmount: number
  items: { test: { name: string; price: number } }[]
  lab: { name: string; phone: string }
}

export default function ConfirmPage() {
  const { labId, bookingId } = useParams<{ labId: string; bookingId: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetch(`/api/booking/${bookingId}`).then(r => r.json()).then(setBooking)
  }, [bookingId])

  if (!booking) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto p-6 pb-12">
      <div className="text-center pt-10 pb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
        <h1 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h1>
        <p className="text-gray-500 mt-2">Our team will contact you to confirm the slot.</p>
      </div>

      <div className="card p-4 mb-4 bg-blue-50 border-blue-100 text-center">
        <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">Booking ID</p>
        <p className="font-mono text-blue-800 font-bold text-lg tracking-widest">{booking.id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="card p-4 space-y-3 mb-4">
        {[
          ['Patient',  booking.patientName],
          ['Phone',    booking.phone],
          ['Address',  booking.address],
          ['Date',     booking.date],
          ['Time',     booking.time],
          ['Payment',  booking.paymentMode === 'Cash' ? '💵 Cash on Collection' : '💳 Online'],
          ['Status',   '🟡 Pending'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-gray-400 shrink-0">{label}</span>
            <span className="text-gray-700 font-medium text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Tests Booked</h3>
        {booking.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-gray-700">{item.test.name}</span>
            <span className="text-blue-700 font-semibold">₹{item.test.price}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-base pt-3">
          <span>Total</span>
          <span className="text-blue-700">₹{booking.totalAmount}</span>
        </div>
      </div>

      <button onClick={() => router.push(`/lab/${labId}/track?phone=${booking.phone}`)} className="btn-primary w-full mb-3">
        📋 Track My Booking
      </button>
      <button onClick={() => router.push(`/lab/${labId}`)} className="btn-outline w-full">
        ← Back to Tests
      </button>
    </div>
  )
}
