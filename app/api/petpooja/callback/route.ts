// ---------------------------------------------------------------------------
// Webhook: POST /api/petpooja/callback  (Task 2d)
// ---------------------------------------------------------------------------
// Petpooja posts order status updates here as an order progresses through
// the kitchen. Status code mapping:
//   "1" → accepted   "2" → rejected   "3" → food_ready
//   "4" → dispatched  "5" → delivered
//
// CRITICAL: We must respond HTTP 200 immediately. Petpooja has a short
// response-timeout window and will retry if we don't ack fast. We ack first,
// then write to DB asynchronously after the response is prepared.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PETPOOJA_ORDER_STATUS } from '@/services/petpooja/types';
import type { OrderCallbackPayload } from '@/services/petpooja/types';

export async function POST(req: NextRequest) {
  let body: OrderCallbackPayload;

  try {
    body = await req.json();
  } catch {
    // Return 200 even on parse failure — Petpooja must not retry a malformed
    // payload indefinitely. Log it so we can investigate.
    console.error('[callback] Failed to parse request body');
    return NextResponse.json({ status: '1', message: 'OK' });
  }

  if (!body.orderID || !body.status) {
    console.warn('[callback] Missing orderID or status', body);
    return NextResponse.json({ status: '1', message: 'OK' });
  }

  const internalStatus = PETPOOJA_ORDER_STATUS[body.status] ?? 'unknown';

  console.log(
    `[callback] orderID=${body.orderID} ` +
      `petpooja_status=${body.status} → ${internalStatus}`,
  );

  // Parse times from strings or numbers
  const prepTime = body.minimum_prep_time ? Number(body.minimum_prep_time) : null;
  const deliveryTime = body.minimum_delivery_time ? Number(body.minimum_delivery_time) : null;

  await prisma.orderCallback.create({
    data: {
      orderId: body.orderID,
      status: internalStatus,
      prepTime: !Number.isNaN(prepTime) ? prepTime : null,
      deliveryTime: !Number.isNaN(deliveryTime) ? deliveryTime : null,
      rawJson: JSON.stringify(body),
    },
  });

  return NextResponse.json({ status: '1', message: 'OK' });
}
