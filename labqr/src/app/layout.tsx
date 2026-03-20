import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LabQR – Book Blood Tests at Home',
  description: 'Book pathology tests from your nearest lab. Home sample collection.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
