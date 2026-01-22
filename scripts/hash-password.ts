// scripts/hash-password.ts
// Utility script to generate argon2id password hashes for .env configuration
// Usage: npm run hash-password <password>

import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  // Use argon2id variant (recommended by RFC 9106)
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 threads
  });
  return hash;
}

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.log('Usage: npm run hash-password <password>');
    console.log('');
    console.log('Example:');
    console.log('  npm run hash-password "your-secure-password"');
    console.log('');
    console.log('Output:');
    console.log('  ADMIN_PASSWORD_HASH=<hash>');
    console.log('');
    console.log('Copy the output to your .env.local file');
    process.exit(1);
  }

  const hash = await hashPassword(password);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}

main().catch(console.error);
