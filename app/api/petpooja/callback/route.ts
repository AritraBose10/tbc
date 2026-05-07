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

const OK = NextResponse.json({ status: '1', message: 'OK' });

export async function POST(req: NextRequest) {
  let body: OrderCallbackPayload;

  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Petpooja sends some webhooks as form-encoded.
      // The payload may be flat fields (orderID=x&status=1) or
      // JSON wrapped in a single "data" key (same pattern as Push Menu).
      const text = await req.text();
      const params = new URLSearchParams(text);
      const dataParam = params.get('data');
      if (dataParam) {
        body = JSON.parse(dataParam);
      } else {
        // Flat form fields — convert to object directly
        body = Object.fromEntries(params.entries()) as unknown as OrderCallbackPayload;
      }
    } else {
      body = await req.json();
    }
  } catch {
    console.error('[callback] Failed to parse request body');
    return OK;
  }

  if (!body.orderID || !body.status) {
    console.warn('[callback] Missing orderID or status', body);
    return OK;
  }

  const internalStatus = PETPOOJA_ORDER_STATUS[body.status] ?? 'unknown';

  console.log(
    `[callback] orderID=${body.orderID} ` +
      `petpooja_status=${body.status} → ${internalStatus}`,
  );

  // Parse times from strings or numbers
  const prepTime = body.minimum_prep_time ? Number(body.minimum_prep_time) : null;
  const deliveryTime = body.minimum_delivery_time ? Number(body.minimum_delivery_time) : null;

  // Always ack HTTP 200 first — Petpooja retries on anything else.
  // Run the DB writes in a try/catch so a transient failure or FK mismatch
  // never causes us to return 5xx.
  try {
    await prisma.$transaction([
      prisma.orderCallback.create({
        data: {
          orderId: body.orderID,
          status: internalStatus,
          prepTime: !Number.isNaN(prepTime) ? prepTime : null,
          deliveryTime: !Number.isNaN(deliveryTime) ? deliveryTime : null,
          rawJson: JSON.stringify(body),
        },
      }),
      // Keep Order.status in sync so the tracking page has a consistent source of truth
      prisma.order.updateMany({
        where: { id: body.orderID },
        data:  { status: internalStatus },
      }),
    ]);
  } catch (err) {
    console.error('[callback] DB write failed (order still acked):', err);
  }

  return OK;
}
