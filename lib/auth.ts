import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

import { Redis } from '@upstash/redis';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'krapper-default-secret-change-me'
);

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SessionData {
  fid: string; // Fingerprint ID
  count: number;
  iat: number;
}

/**
 * Creates a simple fingerprint based on IP and User-Agent
 * Works in both API routes (NextRequest) and Server Components (Headers)
 */
export function getFingerprint(source: NextRequest | Headers) {
  let ip = '127.0.0.1';
  let ua = 'unknown';

  const getHeader = (h: string) => {
    if ('headers' in source && typeof source.headers.get === 'function') {
      return source.headers.get(h);
    } else if (typeof (source as Headers).get === 'function') {
      return (source as Headers).get(h);
    }
    return null;
  };

  // Try to get a reliable IP - Prioritize headers for consistency
  ip = getHeader('x-forwarded-for')?.split(',')[0] || 
       getHeader('x-real-ip') || 
       getHeader('cf-connecting-ip') || // Cloudflare
       ('ip' in source ? (source as any).ip : null) || 
       '127.0.0.1';

  // Scrub any IPv6 localhost to stay consistent with '127.0.0.1'
  if (ip === '::1') ip = '127.0.0.1';

  ua = getHeader('user-agent') || 'unknown';
  
  const fid = btoa(`${ip}-${ua}`).substring(0, 32);
  return fid;
}

/**
 * Checks and increments usage for a free-tier user using Redis
 * Returns { allowed: boolean, count: number }
 */
export async function checkQuota(fid: string): Promise<{ allowed: boolean; count: number }> {
  const key = `usage:${fid}`;
  const limit = 3;
  
  const currentCount = await redis.get<number>(key) || 0;
  
  if (currentCount < limit) {
    const newCount = await redis.incr(key);
    // Set 24h expiration on the first increment
    if (newCount === 1) {
      await redis.expire(key, 86400);
    }
    return { allowed: true, count: newCount };
  }
  
  return { allowed: false, count: currentCount };
}

/**
 * Gets current usage without incrementing
 */
export async function getUsage(fid: string): Promise<number> {
  const count = await redis.get<number>(`usage:${fid}`);
  return count || 0;
}

/**
 * Signs a session token
 */
export async function createSessionToken(data: SessionData) {
  return await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verifies a session token
 */
export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionData;
  } catch (err) {
    return null;
  }
}
