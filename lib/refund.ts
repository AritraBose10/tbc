import { prisma } from './prisma';
import Razorpay from 'razorpay';

export async function triggerRazorpayRefund(orderId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[refund] Attempting to trigger refund for order ${orderId}, reason: ${reason}`);

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.warn(`[refund] Order ${orderId} not found`);
      return { success: false, error: 'Order not found' };
    }

    // Only refund if it was paid online and captured
    if (order.paymentType !== 'ONLINE' || order.paymentStatus !== 'paid' || !order.razorpayPaymentId) {
      console.log(`[refund] Order ${orderId} is not eligible for refund (Type: ${order.paymentType}, Status: ${order.paymentStatus})`);
      return { success: true }; // Not an error, just not eligible for refund
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[refund] Razorpay credentials not configured');
      return { success: false, error: 'Payment credentials not configured' };
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(order.totalAmount * 100);

    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: amountInPaise,
      notes: {
        orderId: order.id,
        reason: reason,
      },
    });

    console.log(`[refund] Successfully initiated Razorpay refund ${refund.id} for order ${orderId}`);

    // Update order status to refund_initiated
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'refund_initiated' },
    });

    return { success: true };
  } catch (error: any) {
    console.error(`[refund] Error refunding order ${orderId}:`, error);

    // Send an email alert to the admin/support team
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        const { sendRefundFailureEmail } = await import('./email');
        await sendRefundFailureEmail('digital@offbeatccu.com', {
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
          amount: order.totalAmount,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          errorReason: error?.message || 'Unknown error during refund call',
        });
        console.log(`[refund] Emailed refund failure alert for order ${orderId} to digital@offbeatccu.com`);
      }
    } catch (emailErr) {
      console.error('[refund] Failed to send refund failure alert email:', emailErr);
    }

    return { success: false, error: error?.message || 'Refund request failed' };
  }
}
