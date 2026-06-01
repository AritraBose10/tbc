import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { cancelPetpoojaOrder } from '@/services/petpooja/cancel-order';

const CANCEL_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  // Ownership check — userId is nullable for guest orders, so only enforce when set
  if (order.userId && order.userId !== authUser.userId) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  // Already in a terminal state
  if (['cancelled', 'rejected', 'delivered'].includes(order.status)) {
    return NextResponse.json(
      { success: false, error: `Order is already ${order.status}` },
      { status: 409 },
    );
  }

  // 2-minute cancellation window
  const ageMs = Date.now() - new Date(order.createdAt).getTime();
  if (ageMs > CANCEL_WINDOW_MS) {
    return NextResponse.json(
      { success: false, error: 'Cancellation window has expired' },
      { status: 409 },
    );
  }

  const result = await cancelPetpoojaOrder(orderId);
  if (!result.success) {
    console.error(`[cancel] Petpooja cancel failed for ${orderId}:`, result.error);
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 502 },
    );
  }

  await prisma.order.update({
    where: { id: orderId },
    data:  { status: 'cancelled' },
  });

  // Trigger automatic refund for online-paid orders
  try {
    const { triggerRazorpayRefund } = await import('@/lib/refund');
    await triggerRazorpayRefund(orderId, 'User cancelled order within window');
  } catch (refundErr) {
    console.error(`[cancel] Failed to initiate automatic refund for ${orderId}:`, refundErr);
  }

  return NextResponse.json({ success: true });
}
