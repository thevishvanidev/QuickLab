import { AdminAuthProvider } from '@/lib/admin-auth'
import Link from 'next/link'
import NavBar from './navbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </div>
    </AdminAuthProvider>
  )
}
