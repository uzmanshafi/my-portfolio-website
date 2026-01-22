import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    adapter: async () => {
      const pg = await import('pg');
      const { Pool } = pg.default;
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      return new PrismaPg(pool);
    },
  },
});
