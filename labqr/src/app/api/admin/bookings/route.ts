import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status')

  const bookings = await prisma.booking.findMany({
    where: { ...(status && status !== 'All' ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { test: { select: { name: true, price: true } } } },
      lab:   { select: { name: true } },
    },
  })

  return NextResponse.json({ bookings })
}
