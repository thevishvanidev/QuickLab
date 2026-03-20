import { NextRequest } from 'next/server'

export function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value
  return token === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

export function checkTechAuth(req: NextRequest): boolean {
  const token = req.cookies.get('tech_token')?.value
  return token === (process.env.TECHNICIAN_PASSWORD ?? 'tech123')
}
