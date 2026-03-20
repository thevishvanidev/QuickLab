import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const test = await prisma.test.update({
    where: { id: params.id },
    data: {
      ...(body.name        ? { name: body.name }              : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.price       ? { price: Number(body.price) }   : {}),
      ...(body.category    ? { category: body.category }     : {}),
    },
  })
  return NextResponse.json(test)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.bookingItem.deleteMany({ where: { testId: params.id } })
  await prisma.test.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
