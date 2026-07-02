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
      isVisible: true,
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

  let body: { item_ids: string[]; available?: boolean; visible?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.item_ids) || body.item_ids.length === 0) {
    return NextResponse.json({ error: 'item_ids must be a non-empty array' }, { status: 400 });
  }
  if (body.available === undefined && body.visible === undefined) {
    return NextResponse.json({ error: 'available or visible must be provided' }, { status: 400 });
  }

  const data: { isAvailable?: boolean; isVisible?: boolean } = {};
  if (typeof body.available === 'boolean') data.isAvailable = body.available;
  if (typeof body.visible   === 'boolean') data.isVisible   = body.visible;

  const result = await prisma.menuItem.updateMany({
    where: { petpoojaId: { in: body.item_ids } },
    data,
  });

  return NextResponse.json({ updated: result.count });
}
