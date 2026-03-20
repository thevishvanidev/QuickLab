'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export type CartItem = { id: string; name: string; price: number }

type CartCtx = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
  total: number
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const add    = (item: CartItem) => setItems(p => p.find(i => i.id === item.id) ? p : [...p, item])
  const remove = (id: string)    => setItems(p => p.filter(i => i.id !== id))
  const clear  = ()              => setItems([])
  const total  = items.reduce((s, i) => s + i.price, 0)
  return <Ctx.Provider value={{ items, add, remove, clear, total }}>{children}</Ctx.Provider>
}

export const useCart = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
