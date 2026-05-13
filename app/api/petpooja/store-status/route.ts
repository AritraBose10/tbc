// ---------------------------------------------------------------------------
// Webhook: POST /api/petpooja/store-status  (Task 2c)
// ---------------------------------------------------------------------------
// Petpooja pushes this when the restaurant opens or closes their store via POS.
// We persist the open/closed flag in PetpoojaConfig under the key "storeOpen"
// so the ordering UI can block new orders when the kitchen is closed.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { StoreStatusPayload } from '@/services/petpooja/types';

export async function POST(req: NextRequest) {
  let body: StoreStatusPayload;

  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const dataParam = params.get('data');
      body = dataParam ? JSON.parse(dataParam) : Object.fromEntries(params.entries()) as unknown as StoreStatusPayload;
    } else {
      body = await req.json();
    }
  } catch {
    return NextResponse.json(
      { status: '0', message: 'Invalid request body' },
      { status: 400 },
    );
  }

  if (!body.restaurant_id) {
    return NextResponse.json(
      { status: '0', message: 'Missing restaurant_id' },
      { status: 400 },
    );
  }

  const isOpen = body.is_open === '1';

  await prisma.petpoojaConfig.upsert({
    where: { key: 'storeOpen' },
    update: { value: isOpen ? '1' : '0' },
    create: { key: 'storeOpen', value: isOpen ? '1' : '0' },
  });

  console.log(
    `[store-status] restaurant_id=${body.restaurant_id} isOpen=${isOpen}`,
  );

  return NextResponse.json({ status: '1', message: 'Store status updated' });
}
