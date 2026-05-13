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

    // Aggregate order stats by phone (if user has linked their phone)
    let orderCount = 0;
    let totalSpent = 0;
    let recentOrders: { id: string; status: string; totalAmount: number; createdAt: Date; items: { name: string; quantity: number }[] }[] = [];

    if (user.phone) {
      const orders = await prisma.order.findMany({
        where: { customerPhone: user.phone },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { select: { name: true, quantity: true } } },
      });
      orderCount = await prisma.order.count({ where: { customerPhone: user.phone } });
      const spent = await prisma.order.aggregate({
        where: { customerPhone: user.phone },
        _sum: { totalAmount: true },
      });
      totalSpent = spent._sum.totalAmount ?? 0;
      recentOrders = orders;
    }

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
