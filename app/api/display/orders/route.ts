import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PREPARING_STATUSES = ["pending", "accepted", "preparing"];
const READY_STATUSES     = ["ready", "food_ready"];

export async function GET() {
  const since = new Date(Date.now() - 8 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      status: { in: [...PREPARING_STATUSES, ...READY_STATUSES] },
    },
    select: {
      tokenNumber: true,
      status:      true,
      createdAt:   true,
    },
    orderBy: { createdAt: "asc" },
  });

  const preparing = orders.filter((o) => PREPARING_STATUSES.includes(o.status));
  const ready     = orders.filter((o) => READY_STATUSES.includes(o.status));

  return NextResponse.json({ preparing, ready });
}
