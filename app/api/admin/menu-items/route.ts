import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

function isAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email === adminEmail;
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req);
  if (!auth || !isAdmin(auth.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const items = await prisma.menuItem.findMany({
    orderBy: [{ categoryName: 'asc' }, { name: 'asc' }],
    select: {
      petpoojaId: true,
      name: true,
      price: true,
      isAvailable: true,
      categoryId: true,
      categoryName: true,
    },
  });

  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req);
  if (!auth || !isAdmin(auth.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { item_ids: string[]; available: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.item_ids) || body.item_ids.length === 0) {
    return NextResponse.json({ error: 'item_ids must be a non-empty array' }, { status: 400 });
  }
  if (typeof body.available !== 'boolean') {
    return NextResponse.json({ error: 'available must be a boolean' }, { status: 400 });
  }

  const result = await prisma.menuItem.updateMany({
    where: { petpoojaId: { in: body.item_ids } },
    data: { isAvailable: body.available },
  });

  return NextResponse.json({ updated: result.count });
}
