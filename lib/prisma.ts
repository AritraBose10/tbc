import { PrismaClient } from '@prisma/client';

// next.config.ts lists @prisma/client in serverExternalPackages so that
// Next.js/Turbopack does NOT bundle Prisma. This lets Prisma run as a native
// Node.js module where it resolves the SQLite file path correctly from
// DATABASE_URL (file:./prisma/petpooja.db, relative to project root).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
