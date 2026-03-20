'use client'
import { CartProvider } from '@/lib/cart'
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
