import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password, role } = await req.json()
  const adminPw = process.env.ADMIN_PASSWORD ?? 'admin123'
  const techPw  = process.env.TECHNICIAN_PASSWORD ?? 'tech123'

  if (role === 'admin' && password === adminPw) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', adminPw, { httpOnly: true, path: '/', maxAge: 86400 })
    return res
  }
  if (role === 'technician' && password === techPw) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('tech_token', techPw, { httpOnly: true, path: '/', maxAge: 86400 })
    return res
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}

export async function DELETE(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role')
  const res  = NextResponse.json({ ok: true })
  if (role === 'admin')      res.cookies.delete('admin_token')
  if (role === 'technician') res.cookies.delete('tech_token')
  return res
}
