import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { labId, patientName, phone, address, date, time, paymentMode, testIds } = body

    if (!labId || !patientName || !phone || !address || !date || !time || !Array.isArray(testIds) || testIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const lab = await prisma.lab.findUnique({ where: { id: labId } })
    if (!lab) return NextResponse.json({ error: 'Lab not found' }, { status: 404 })

    const tests = await prisma.test.findMany({ where: { id: { in: testIds }, labId } })
    if (tests.length === 0) return NextResponse.json({ error: 'No valid tests' }, { status: 400 })

    const totalAmount = tests.reduce((s, t) => s + t.price, 0)

    const booking = await prisma.booking.create({
      data: {
        labId, patientName, phone, address, date, time,
        paymentMode: paymentMode || 'Cash',
        totalAmount,
        status: 'Pending',
        items: { create: tests.map(t => ({ testId: t.id })) },
      },
    })

    return NextResponse.json({ id: booking.id, totalAmount }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/booking]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET /api/booking?phone=XXXXXXXXXX
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone')
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

    const bookings = await prisma.booking.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { test: { select: { name: true, price: true } } } },
        lab:   { select: { name: true, phone: true } },
      },
    })

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error('[GET /api/booking]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
