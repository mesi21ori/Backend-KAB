/**
 * Lightweight password utilities for the frontend-only demo.
 * These functions simulate hashing and verification so that
 * no plain text passwords are stored in application state.
 *
 * NOTE: This is NOT secure cryptography – it is only for demo UX.
 */

const SALT = 'ahadu-demo-salt-v1';

/**
 * Generate a random temporary password using the Web Crypto API.
 * Returns a URL-safe string suitable for emailing to the user.
 */
export function generateTempPassword(length = 10): string {
  if (length <= 0) {
    length = 10;
  }

  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
  const randomValues = new Uint32Array(length);

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < randomValues.length; i++) {
      randomValues[i] = Math.floor(Math.random() * alphabet.length);
    }
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const index = randomValues[i] % alphabet.length;
    password += alphabet[index];
  }
  return password;
}

/**
 * Simulate hashing by combining the password with a static salt
 * and running a simple non-cryptographic transform, then base64 encoding.
 */
export function hashPassword(plain: string): string {
  const value = `${plain}${SALT}`;
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    hash = (hash * 31 + charCode) | 0;
  }

  // Encode the numeric hash as a base64 string to look like a hash
  return typeof btoa === 'function'
    ? btoa(String(hash))
    : Buffer.from(String(hash), 'utf-8').toString('base64');
}

/**
 * Recompute the simulated hash and compare it to the stored hash.
 */
export function verifyPassword(plain: string, hash: string): boolean {
  if (!hash) return false;
  return hashPassword(plain) === hash;
}

/**
 * Compute an ISO timestamp exactly `hours` from now.
 * Default is 72 hours for temporary password expiry.
 */
export function getTempExpiry(hours = 72): string {
  const ms = hours * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString();
}

