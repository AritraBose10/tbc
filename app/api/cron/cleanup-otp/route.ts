import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by Vercel Cron (vercel.json) every hour.
// Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const [{ count: otpDeleted }, { count: rlDeleted }] = await Promise.all([
    prisma.otpSession.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }),
  ]);

  return NextResponse.json({ otpDeleted, rateLimitsDeleted: rlDeleted });
}
