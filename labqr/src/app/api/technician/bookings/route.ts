import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkTechAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!checkTechAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { status: 'Assigned' },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    include: {
      items: { include: { test: { select: { name: true } } } },
      lab:   { select: { name: true, phone: true } },
    },
  })
  return NextResponse.json({ bookings })
}
