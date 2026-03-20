'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'
import { useParams, useRouter } from 'next/navigation'

type Test = { id: string; name: string; description: string | null; price: number; category: string }
type Lab  = { id: string; name: string; phone: string; address: string }

const CATEGORIES = ['All', 'Blood', 'Hormone', 'Organ', 'Vitamin', 'Urine', 'Infection']

export default function LabPage() {
  const { labId } = useParams<{ labId: string }>()
  const { items, add, remove, total } = useCart()
  const router = useRouter()

  const [lab, setLab]         = useState<Lab | null>(null)
  const [tests, setTests]     = useState<Test[]>([])
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch(`/api/lab/${labId}`)
      .then(r => r.json())
      .then(d => { setLab(d.lab); setTests(d.tests || []) })
      .catch(() => setError('Failed to load lab'))
      .finally(() => setLoading(false))
  }, [labId])

  const filtered = tests.filter(t =>
    (cat === 'All' || t.category === cat) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  )
  const inCart = (id: string) => items.some(i => i.id === id)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading…</p>
      </div>
    </div>
  )

  if (error || !lab) return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🔬</div>
        <h1 className="text-xl font-bold text-gray-800">Lab not found</h1>
        <p className="text-gray-500 mt-2">Please scan the correct QR code.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white px-6 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🧬</div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{lab.name}</h1>
            <p className="text-blue-100 text-sm">{lab.address}</p>
          </div>
        </div>
        <a href={`tel:${lab.phone}`} className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-sm font-medium">
          📞 {lab.phone}
        </a>
        <div className="flex gap-2 mt-4 flex-wrap">
          {['✅ Certified Techs', '🧤 Hygienic', '⚡ Fast Reports'].map(b => (
            <span key={b} className="bg-white/15 rounded-full px-3 py-1 text-xs font-medium">{b}</span>
          ))}
        </div>
      </div>

      {/* Track link */}
      <div className="px-4 pt-4">
        <button
          onClick={() => router.push(`/lab/${labId}/track`)}
          className="w-full py-3 bg-blue-50 text-blue-700 font-semibold rounded-2xl text-sm border border-blue-100 hover:bg-blue-100 transition"
        >
          📋 Track My Booking
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <input
          className="input"
          placeholder="🔍  Search tests…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition
              ${cat === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tests list */}
      <div className="px-4 pt-4 space-y-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {filtered.length} test{filtered.length !== 1 ? 's' : ''} available
        </p>
        {filtered.map(test => (
          <div key={test.id} className="card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm leading-snug">{test.name}</h3>
              {test.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{test.description}</p>}
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">{test.category}</span>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-blue-700 text-base">₹{test.price}</p>
              {inCart(test.id)
                ? <button onClick={() => remove(test.id)} className="mt-1 text-xs text-red-500 font-semibold border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50">Remove</button>
                : <button onClick={() => add({ id: test.id, name: test.name, price: test.price })} className="mt-1 text-xs text-blue-600 font-semibold border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50">+ Add</button>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Sticky cart bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-xl z-50">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push(`/lab/${labId}/book`)}
              className="btn-primary w-full flex items-center justify-between text-base"
            >
              <span className="bg-white/20 rounded-xl px-2.5 py-1 text-sm">{items.length} test{items.length > 1 ? 's' : ''}</span>
              <span>Book Home Collection</span>
              <span>₹{total}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
