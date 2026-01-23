import { EncryptJWT, jwtDecrypt } from 'jose';

// Secret key for encrypting GitHub tokens at rest
// Uses AUTH_SECRET which is already required for Auth.js
function getEncryptionKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }
  // Use first 32 chars of AUTH_SECRET as encryption key
  // jose requires a Uint8Array key
  return new TextEncoder().encode(secret.slice(0, 32).padEnd(32, '0'));
}

/**
 * Encrypts a GitHub access token for database storage.
 * Uses AES-256-GCM via jose's EncryptJWT.
 */
export async function encryptToken(token: string): Promise<string> {
  const secret = getEncryptionKey();

  const jwt = await new EncryptJWT({ token })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(secret);

  return jwt;
}

/**
 * Decrypts a stored GitHub access token.
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  const secret = getEncryptionKey();

  const { payload } = await jwtDecrypt(encryptedToken, secret);

  if (typeof payload.token !== 'string') {
    throw new Error('Invalid encrypted token payload');
  }

  return payload.token;
}
