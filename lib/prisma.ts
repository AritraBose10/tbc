import path from 'path';
import { PrismaClient } from '@prisma/client';

// In Turbopack-bundled code, relative DATABASE_URL paths (file:./prisma/petpooja.db)
// are resolved relative to an internal Turbopack context directory, not the project
// root — causing SQLite Error code 14 (SQLITE_CANTOPEN).
//
// Fix: compute an absolute path at module init time. We use INIT_CWD (set by npm to
// the directory where `npm run` was invoked) then fall back to PWD (shell CWD) and
// finally process.cwd() for non-npm invocations like ts-node / tsx scripts.
const projectRoot =
  process.env.INIT_CWD ??
  process.env.PWD ??
  process.cwd();

const DB_URL = `file:${path.resolve(projectRoot, 'prisma', 'petpooja.db')}`;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasources: { db: { url: DB_URL } } });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
