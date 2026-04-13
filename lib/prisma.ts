import { PrismaClient } from '@prisma/client';

// Singleton pattern: prevents multiple PrismaClient instances during
// Next.js hot-module reload in development. Mirrors the pattern used
// in seminar-booking/src/lib/prisma.ts without the Neon adapter
// (SQLite uses the standard driver).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
