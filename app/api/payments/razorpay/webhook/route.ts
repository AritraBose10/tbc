// ---------------------------------------------------------------------------
// Webhook: POST /api/payments/razorpay/webhook
// ---------------------------------------------------------------------------
// Razorpay POSTs signed events here for:
//   payment.captured  → mark order paymentStatus = 'paid'
//   payment.failed    → mark order paymentStatus = 'payment_failed'
//   refund.processed  → mark order paymentStatus = 'refunded'
//
// Verification: HMAC-SHA256 of raw body using RAZORPAY_WEBHOOK_SECRET
// CRITICAL: Always respond 200 quickly; processing is best-effort.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const OK = NextResponse.json({ received: true }, { status: 200 });

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // ── Read raw body for signature verification ─────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  console.log('[razorpay-webhook] Received event, sig:', signature.slice(0, 12) + '...');

  // ── Verify signature ──────────────────────────────────────────────────────
  if (!webhookSecret) {
    console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set — rejecting');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    console.warn('[razorpay-webhook] Signature mismatch — request rejected');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── Parse event ───────────────────────────────────────────────────────────
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error('[razorpay-webhook] Failed to parse JSON body');
    return OK; // Still return 200 so Razorpay doesn't retry a malformed payload
  }

  const eventType = event.event as string;
  const payload   = event.payload as Record<string, unknown>;

  console.log('[razorpay-webhook] Event type:', eventType);

  // ── Handle events ─────────────────────────────────────────────────────────
  try {
    switch (eventType) {

      // ── payment.captured ─────────────────────────────────────────────────
      // Fired when a payment is successfully captured.
      // Source of truth: update order to paid if it was pending payment.
      case 'payment.captured': {
        const paymentEntity = (payload.payment as Record<string, unknown>)?.entity as Record<string, unknown>;
        if (!paymentEntity) { console.warn('[razorpay-webhook] No payment entity'); break; }

        const razorpayPaymentId = paymentEntity.id         as string;
        const razorpayOrderId   = paymentEntity.order_id   as string;
        const amountPaise       = paymentEntity.amount     as number;
        const amountRupees      = amountPaise / 100;

        console.log(`[razorpay-webhook] payment.captured: paymentId=${razorpayPaymentId}, orderId=${razorpayOrderId}, amount=₹${amountRupees}`);

        // Find matching order by razorpayOrderId
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        if (!order) {
          console.warn(`[razorpay-webhook] No order found for razorpayOrderId=${razorpayOrderId}`);
          break;
        }

        if (order.paymentStatus === 'paid') {
          console.log(`[razorpay-webhook] Order ${order.id} already marked paid — skipping`);
          break;
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus:     'paid',
            razorpayPaymentId: razorpayPaymentId,
          },
        });

        console.log(`[razorpay-webhook] ✓ Order ${order.id} marked as paid via webhook`);
        break;
      }

      // ── payment.failed ───────────────────────────────────────────────────
      // Fired when a payment attempt fails (card declined, UPI timeout, etc.)
      case 'payment.failed': {
        const paymentEntity = (payload.payment as Record<string, unknown>)?.entity as Record<string, unknown>;
        if (!paymentEntity) { console.warn('[razorpay-webhook] No payment entity'); break; }

        const razorpayOrderId   = paymentEntity.order_id as string;
        const errorDescription  = (paymentEntity.error_description as string) ?? 'Unknown failure';
        const errorCode         = (paymentEntity.error_code as string) ?? '';

        console.log(`[razorpay-webhook] payment.failed: orderId=${razorpayOrderId}, error=${errorCode} — ${errorDescription}`);

        if (!razorpayOrderId) break;

        await prisma.order.updateMany({
          where:  { razorpayOrderId, paymentStatus: { not: 'paid' } },
          data:   { paymentStatus: 'payment_failed' },
        });

        console.log(`[razorpay-webhook] ✓ Order for razorpayOrderId=${razorpayOrderId} marked payment_failed`);
        break;
      }

      // ── refund.processed ─────────────────────────────────────────────────
      // Fired when a refund is successfully processed by Razorpay.
      case 'refund.processed': {
        const refundEntity = (payload.refund as Record<string, unknown>)?.entity as Record<string, unknown>;
        if (!refundEntity) { console.warn('[razorpay-webhook] No refund entity'); break; }

        const razorpayPaymentId = refundEntity.payment_id as string;
        const refundId          = refundEntity.id         as string;
        const amountPaise       = refundEntity.amount     as number;

        console.log(`[razorpay-webhook] refund.processed: paymentId=${razorpayPaymentId}, refundId=${refundId}, amount=₹${amountPaise / 100}`);

        await prisma.order.updateMany({
          where: { razorpayPaymentId },
          data:  { paymentStatus: 'refunded' },
        });

        console.log(`[razorpay-webhook] ✓ Order for paymentId=${razorpayPaymentId} marked refunded`);
        break;
      }

      // ── refund.failed ────────────────────────────────────────────────────
      case 'refund.failed': {
        const refundEntity = (payload.refund as Record<string, unknown>)?.entity as Record<string, unknown>;
        const paymentId    = refundEntity?.payment_id as string ?? 'unknown';
        const failureReason = refundEntity?.error_description as string ?? 'Unknown failure from Razorpay';

        console.error(`[razorpay-webhook] ⚠ refund.failed for paymentId=${paymentId} — manual intervention required`);

        // Find the matching order and email the admin team
        try {
          const order = await prisma.order.findFirst({
            where: { razorpayPaymentId: paymentId }
          });
          if (order) {
            const { sendRefundFailureEmail } = await import('@/lib/email');
            await sendRefundFailureEmail('digital@offbeatccu.com', {
              orderId: order.id,
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: order.razorpayPaymentId,
              amount: order.totalAmount,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              errorReason: `Razorpay webhook refund.failed: ${failureReason}`,
            });
            console.log(`[razorpay-webhook] Emailed refund failure alert for paymentId=${paymentId} to digital@offbeatccu.com`);
          }
        } catch (emailErr) {
          console.error('[razorpay-webhook] Failed to send refund failure alert email:', emailErr);
        }
        break;
      }

      default:
        console.log(`[razorpay-webhook] Unhandled event type: ${eventType} — ignoring`);
    }
  } catch (err) {
    // Log but don't crash — always return 200 so Razorpay won't retry endlessly
    console.error('[razorpay-webhook] Error processing event:', err);
  }

  return OK;
}
