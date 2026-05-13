import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      callbacks: { orderBy: { receivedAt: 'asc' } },
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    success:      true,
    id:           order.id,
    status:       order.status,
    orderType:    order.orderType,
    tokenNumber:  order.tokenNumber,
    customerName: order.customerName,
    totalAmount:  order.totalAmount,
    createdAt:    order.createdAt,
    items:        order.items.map((i) => ({
      name:     i.name,
      quantity: i.quantity,
      price:    i.price,
      addons:   JSON.parse(i.addons) as { name: string; price: number }[],
    })),
    callbacks: order.callbacks.map((c) => ({
      status:      c.status,
      prepTime:    c.prepTime,
      receivedAt:  c.receivedAt,
    })),
  });
}
