import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Pull prepTime / deliveryTime from the latest callback if present.
    const latestCallback = await prisma.orderCallback.findFirst({
      where: { orderId },
      orderBy: { receivedAt: 'desc' },
    });

    return NextResponse.json(
      {
        status:       order.status,          // source of truth
        prepTime:     latestCallback?.prepTime     ?? null,
        deliveryTime: latestCallback?.deliveryTime ?? null,
        receivedAt:   latestCallback?.receivedAt   ?? null,
        orderDetails: order,
      },
      { headers: NO_CACHE },
    );
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
