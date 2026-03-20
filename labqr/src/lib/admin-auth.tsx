'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type AdminCtx = { logout: () => void }
const Ctx = createContext<AdminCtx>({ logout: () => {} })
export const useAdmin = () => useContext(Ctx)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed,   setAuthed]   = useState(false)
  const [pw,       setPw]       = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then(r => { if (r.ok) setAuthed(true) })
      .finally(() => setChecking(false))
  }, [])

  const login = async () => {
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw, role: 'admin' }),
    })
    if (res.ok) setAuthed(true)
    else setError('Wrong password. Default is: admin123')
    setLoading(false)
  }

  const logout = async () => {
    await fetch('/api/auth?role=admin', { method: 'DELETE' })
    setAuthed(false)
    router.push('/admin')
  }

  if (checking) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authed) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🔬</div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">LabQR Dashboard</p>
        </div>
        <input
          className="input mb-3"
          type="password"
          placeholder="Enter admin password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={login} disabled={loading} className="btn-primary w-full">
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">
          Default: <code className="bg-gray-100 px-1 rounded">admin123</code>
        </p>
      </div>
    </div>
  )

  return <Ctx.Provider value={{ logout }}>{children}</Ctx.Provider>
}
