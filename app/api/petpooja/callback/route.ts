// ---------------------------------------------------------------------------
// Webhook: POST /api/petpooja/callback
// ---------------------------------------------------------------------------
// Petpooja posts order status updates here.
// Known field name variants (Petpooja sends snake_case in production):
//   order_id / orderID
//   callback_order_status / status
//
// CRITICAL: We must respond HTTP 200 immediately.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PETPOOJA_ORDER_STATUS } from '@/services/petpooja/types';

const OK = NextResponse.json({ status: '1', message: 'OK' });

export async function POST(req: NextRequest) {
  // Read raw body first so we can log exactly what Petpooja sent.
  const rawText = await req.text();
  const contentType = req.headers.get('content-type') ?? '';

  console.log('[callback] INCOMING REQUEST', {
    contentType,
    rawBody: rawText,
  });

  // Parse body — handle form-encoded (flat or data-wrapped) and JSON.
  let body: Record<string, unknown> = {};
  try {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawText);
      const dataParam = params.get('data');
      if (dataParam) {
        body = JSON.parse(dataParam);
      } else {
        body = Object.fromEntries(params.entries());
      }
    } else {
      body = JSON.parse(rawText);
    }
  } catch {
    console.error('[callback] Failed to parse body — raw text logged above');
    return OK;
  }

  console.log('[callback] PARSED BODY', body);

  // Accept all known field name variants.
  const orderId    = (body.order_id    ?? body.orderID    ?? '') as string;
  const statusCode = (body.callback_order_status ?? body.status ?? '') as string;

  if (!orderId || !statusCode) {
    console.warn('[callback] Cannot resolve orderId or statusCode from parsed body', body);
    return OK;
  }

  const internalStatus = PETPOOJA_ORDER_STATUS[statusCode] ?? 'unknown';
  console.log(`[callback] orderId=${orderId} petpooja_status=${statusCode} → ${internalStatus}`);

  const prepTime     = body.minimum_prep_time     ? Number(body.minimum_prep_time)     : null;
  const deliveryTime = body.minimum_delivery_time ? Number(body.minimum_delivery_time) : null;

  // Update Order.status first — no FK risk, always works if the order exists.
  try {
    await prisma.order.updateMany({
      where: { id: orderId },
      data:  { status: internalStatus },
    });
  } catch (err) {
    console.error('[callback] Order.status update failed:', err);
  }

  // Write the full callback row separately — may fail if orderId has no matching Order.
  try {
    await prisma.orderCallback.create({
      data: {
        orderId,
        status:       internalStatus,
        prepTime:     prepTime     != null && !Number.isNaN(prepTime)     ? prepTime     : null,
        deliveryTime: deliveryTime != null && !Number.isNaN(deliveryTime) ? deliveryTime : null,
        rawJson:      JSON.stringify(body),
      },
    });
  } catch (err) {
    console.error('[callback] OrderCallback.create failed (Order.status already updated):', err);
  }

  return OK;
}
