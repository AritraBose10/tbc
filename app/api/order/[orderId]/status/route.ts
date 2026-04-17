import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const latestCallback = await prisma.orderCallback.findFirst({
      where: { orderId },
      orderBy: { receivedAt: 'desc' },
    });

    // Fetch the order and its items
    const orderDetails = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!latestCallback) {
      // No callback yet means it's still pending/waiting for acceptance
      return NextResponse.json({
        status: 'pending',
        prepTime: null,
        deliveryTime: null,
        receivedAt: null,
        orderDetails,
      });
    }

    return NextResponse.json({
      status: latestCallback.status, // e.g. "accepted", "dispatched", "delivered"
      prepTime: latestCallback.prepTime,
      deliveryTime: latestCallback.deliveryTime,
      receivedAt: latestCallback.receivedAt,
      orderDetails,
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
