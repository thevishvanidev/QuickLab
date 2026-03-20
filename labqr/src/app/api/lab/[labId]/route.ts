import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const lab = await prisma.lab.findUnique({ where: { id: params.labId } })
    if (!lab) return NextResponse.json({ error: 'Lab not found' }, { status: 404 })

    const tests = await prisma.test.findMany({
      where: { labId: params.labId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ lab, tests })
  } catch (err) {
    console.error('[GET /api/lab/[labId]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
