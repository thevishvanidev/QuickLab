'use client'
import { useEffect, useState } from 'react'

const LAB_ID    = 'demo-lab-001'
const CATS      = ['Blood','Hormone','Organ','Vitamin','Urine','Infection','Other']
const emptyForm = { name: '', description: '', price: '', category: 'Blood' }

type Test = { id: string; name: string; description: string | null; price: number; category: string }

export default function AdminTests() {
  const [tests,    setTests]    = useState<Test[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTgt,  setEditTgt]  = useState<Test | null>(null)
  const [form,     setForm]     = useState(emptyForm)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/tests?labId=${LAB_ID}`)
    const data = await res.json()
    setTests(data.tests || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew  = () => { setEditTgt(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (t: Test) => {
    setEditTgt(t)
    setForm({ name: t.name, description: t.description || '', price: String(t.price), category: t.category })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    const payload = { ...form, price: Number(form.price) }
    if (editTgt) {
      await fetch(`/api/admin/tests/${editTgt.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/admin/tests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, labId: LAB_ID }) })
    }
    setSaving(false); setShowForm(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this test? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/admin/tests/${id}`, { method: 'DELETE' })
    setDeleting(null); load()
  }

  const grouped = CATS.reduce((acc, cat) => {
    const list = tests.filter(t => t.category === cat)
    if (list.length) acc[cat] = list
    return acc
  }, {} as Record<string, Test[]>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Test Menu <span className="text-gray-400 font-normal text-lg">({tests.length})</span></h1>
        <button onClick={openNew} className="btn-primary text-sm px-5 py-2.5">+ Add Test</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">{cat} ({list.length})</h2>
              <div className="space-y-2">
                {list.map(t => (
                  <div key={t.id} className="card p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{t.name}</p>
                      {t.description && <p className="text-sm text-gray-400 truncate">{t.description}</p>}
                    </div>
                    <p className="font-bold text-blue-700 shrink-0 w-20 text-right">₹{t.price}</p>
                    <button onClick={() => openEdit(t)} className="text-sm text-blue-600 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 shrink-0">Edit</button>
                    <button onClick={() => del(t.id)} disabled={deleting === t.id}
                      className="text-sm text-red-500 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 shrink-0 disabled:opacity-50">
                      {deleting === t.id ? '…' : 'Del'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-5">{editTgt ? 'Edit Test' : 'Add New Test'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Test Name *</label>
                <input className="input" placeholder="e.g. Complete Blood Count" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Description</label>
                <input className="input" placeholder="Short description (optional)" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Price (₹) *</label>
                  <input className="input" type="number" min="0" placeholder="299" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Category *</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.price} className="btn-primary flex-1">
                {saving ? 'Saving…' : editTgt ? 'Save Changes' : 'Add Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
