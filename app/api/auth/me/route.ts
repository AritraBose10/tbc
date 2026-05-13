import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Match orders by userId OR phone so orders placed before phone was linked are included
    const orderWhere = {
      OR: [
        { userId: user.id },
        ...(user.phone ? [{ customerPhone: user.phone }] : []),
      ],
    };

    const [recentOrders, orderCount, spent] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { select: { name: true, quantity: true } } },
      }),
      prisma.order.count({ where: orderWhere }),
      prisma.order.aggregate({ where: orderWhere, _sum: { totalAmount: true } }),
    ]);

    const totalSpent = spent._sum.totalAmount ?? 0;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      stats: { orderCount, totalSpent },
      recentOrders,
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
