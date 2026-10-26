import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'atb-software-enterprise-secret-key-2026';
export const COOKIE_NAME = 'atb_session';

export interface SessionUser {
  id: number;
  companyId: number;
  companyName: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isCompanyAdmin?: boolean;
  isPlatformAdmin?: boolean;
}

export interface SessionTokenPayload extends SessionUser {
  exp: number;
  iat: number;
}

/**
 * Standard PBKDF2 Password Hashing
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify Password against stored PBKDF2 hash or fallback demo hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  // Format: salt:hash
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }

  // Fallback direct match for demo mode
  return password === storedHash;
}

/**
 * Generate HMAC-SHA256 Signed JWT-like Session Token
 */
export function createSessionToken(user: SessionUser, expiresInHours = 24): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    ...user,
    iat: now,
    exp: now + expiresInHours * 3600,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and Decode Session Token
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

