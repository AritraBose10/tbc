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

    const NO_CACHE = { 'Cache-Control': 'no-store' };

    if (!latestCallback) {
      return NextResponse.json(
        { status: 'pending', prepTime: null, deliveryTime: null, receivedAt: null, orderDetails },
        { headers: NO_CACHE },
      );
    }

    return NextResponse.json(
      {
        status: latestCallback.status,
        prepTime: latestCallback.prepTime,
        deliveryTime: latestCallback.deliveryTime,
        receivedAt: latestCallback.receivedAt,
        orderDetails,
      },
      { headers: NO_CACHE },
    );
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
