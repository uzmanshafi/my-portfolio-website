import * as dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load .env.local first (local overrides), then .env (defaults)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
});
