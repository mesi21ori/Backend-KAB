import { createHash, timingSafeEqual } from 'crypto';

const SALT = 'ahadu-demo-salt-v1';

/** Hash password for storage. In production use bcrypt. */
export function hashPassword(plain: string): string {
  const value = `${plain}${SALT}`;
  return createHash('sha256').update(value).digest('base64');
}

/** Verify password against stored hash. */
export function verifyPassword(plain: string, hash: string): boolean {
  if (!hash) return false;
  try {
    const got = hashPassword(plain);
    return got.length === hash.length && timingSafeEqual(Buffer.from(got), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function getTempExpiry(hours = 72): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/** Generate a reasonably strong temporary password. */
export function generateTempPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}
