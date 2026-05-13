import { prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limiter backed by the RateLimit table.
 * Returns { allowed: true } if the key is under the limit for this window,
 * incrementing the counter atomically via upsert.
 *
 * Race note: uses read-then-write (no DB-level lock). Acceptable for OTP
 * flows; replace with Redis + INCR if strict atomicity is ever required.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  // Window expired (or no record) — reset to 1 and allow
  if (!existing || existing.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { allowed: true };
  }

  // Within window — increment and check
  const updated = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return { allowed: updated.count <= limit };
}
