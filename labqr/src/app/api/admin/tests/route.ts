import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const labId = req.nextUrl.searchParams.get('labId')
  if (!labId) return NextResponse.json({ error: 'labId required' }, { status: 400 })

  const tests = await prisma.test.findMany({
    where: { labId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ tests })
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { labId, name, description, price, category } = await req.json()
  if (!labId || !name || !price || !category) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const test = await prisma.test.create({
    data: { labId, name, description: description || null, price: Number(price), category },
  })
  return NextResponse.json(test, { status: 201 })
}
