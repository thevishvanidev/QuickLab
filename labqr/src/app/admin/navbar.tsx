'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdmin } from '@/lib/admin-auth'

export default function NavBar() {
  const { logout } = useAdmin()
  const pathname   = usePathname()

  const nav = [
    { href: '/admin',       label: '📋 Bookings' },
    { href: '/admin/tests', label: '🧪 Tests'    },
  ]

  return (
    <div className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg">🔬 LabQR Admin</span>
        <div className="flex gap-1">
          {nav.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                ${pathname === l.href ? 'bg-white/20' : 'hover:bg-white/10'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <button onClick={logout} className="text-sm text-white/70 hover:text-white">
        Logout →
      </button>
    </div>
  )
}
