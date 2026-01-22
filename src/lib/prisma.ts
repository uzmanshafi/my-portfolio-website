// src/lib/prisma.ts
// Prisma client singleton with pg adapter for Next.js
// Prevents connection exhaustion during hot reloading

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Extend globalThis to cache Prisma client and pool
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

// Create connection pool (reused across hot reloads)
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

// Create adapter and client
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
