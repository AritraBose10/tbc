// ---------------------------------------------------------------------------
// Webhook: POST /api/petpooja/item-status  (Task 2b)
// ---------------------------------------------------------------------------
// Petpooja pushes this when a restaurant toggles an item on or off in POS
// (e.g. they run out of a dish mid-service — "86'd" in kitchen parlance).
// We flip MenuItem.isAvailable so the ordering UI can reflect it in real time.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ItemStatusPayload } from '@/services/petpooja/types';

export async function POST(req: NextRequest) {
  let body: ItemStatusPayload;

  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const dataParam = params.get('data');
      body = dataParam ? JSON.parse(dataParam) : Object.fromEntries(params.entries()) as unknown as ItemStatusPayload;
    } else {
      body = await req.json();
    }
  } catch {
    // Always return HTTP 200 — Petpooja retries indefinitely on non-200 responses.
    return NextResponse.json({ status: '0', message: 'Invalid request body' });
  }

  if (!body.item_id) {
    return NextResponse.json({ status: '0', message: 'Missing item_id' });
  }

  const isAvailable = body.active !== '0';

  const updated = await prisma.menuItem.updateMany({
    where: { petpoojaId: body.item_id },
    data: { isAvailable },
  });

  if (updated.count === 0) {
    // Item not yet in our DB — possible if the toggle fires before Push Menu.
    // Not fatal: log a warning and return 200 so Petpooja doesn't retry endlessly.
    console.warn(
      `[item-status] item_id=${body.item_id} not found in DB — Push Menu may not have fired yet`,
    );
  } else {
    console.log(
      `[item-status] item_id=${body.item_id} isAvailable=${isAvailable}`,
    );
  }

  return NextResponse.json({ status: '1', message: 'Item status updated' });
}
