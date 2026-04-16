import { PrismaClient } from '@prisma/client';
import path from 'path';

// SQLite path resolution differs between contexts:
//   - Prisma CLI: resolves `file:./petpooja.db` relative to prisma/schema.prisma → prisma/petpooja.db ✓
//   - Next.js runtime: DATABASE_URL is already in process.env when PrismaClient is
//     instantiated, so the SQLite engine resolves `./` from the process CWD (project root)
//     → petpooja.db at root (doesn't exist) ✗
//
// Fix: always pass the datasource URL explicitly so it's path-safe in all contexts.
const dbUrl = `file:${path.join(process.cwd(), 'prisma', 'petpooja.db')}`;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasources: { db: { url: dbUrl } } });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
