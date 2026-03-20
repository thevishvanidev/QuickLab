import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { test: { select: { name: true, price: true, category: true } } } },
        lab:   { select: { name: true, phone: true } },
      },
    })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch (err) {
    console.error('[GET /api/booking/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status, technicianName, reportLink } = body

    const valid = ['Pending', 'Assigned', 'Collected', 'ReportReady', 'Completed']
    if (status && !valid.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined            ? { status }         : {}),
        ...(technicianName !== undefined    ? { technicianName } : {}),
        ...(reportLink !== undefined        ? { reportLink }     : {}),
      },
    })
    return NextResponse.json(booking)
  } catch (err) {
    console.error('[PATCH /api/booking/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
