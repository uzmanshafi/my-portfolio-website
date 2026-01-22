// src/app/api/auth/[...nextauth]/route.ts
// Auth.js route handlers for authentication endpoints

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
