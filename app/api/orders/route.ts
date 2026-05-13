import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch orders linked by userId OR by phone (covers orders placed before login)
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        ...(user.phone ? [{ customerPhone: user.phone }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { name: true, quantity: true, price: true } },
    },
  });

  return NextResponse.json({ orders });
}
