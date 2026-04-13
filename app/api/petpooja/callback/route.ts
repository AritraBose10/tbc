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

  if (!body.order_id || !body.callback_order_status) {
    console.warn('[callback] Missing order_id or callback_order_status', body);
    // Still 200 — missing fields are our problem, not Petpooja's
    return NextResponse.json({ status: '1', message: 'OK' });
  }

  // Map Petpooja's numeric status code to a human-readable internal status.
  // "unknown" is a safe fallback for future status codes not yet in our map.
  const internalStatus =
    PETPOOJA_ORDER_STATUS[body.callback_order_status] ?? 'unknown';

  console.log(
    `[callback] order_id=${body.order_id} ` +
      `petpooja_status=${body.callback_order_status} → ${internalStatus}`,
  );

  // Persist for audit trail and async order-state reconciliation.
  // TODO: when an Orders model exists, update its status here or emit an event.
  await prisma.orderCallback.create({
    data: {
      orderId: body.order_id,
      status: internalStatus,
      rawJson: JSON.stringify(body),
    },
  });

  return NextResponse.json({ status: '1', message: 'OK' });
}
