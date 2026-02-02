import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

import { Redis } from '@upstash/redis';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'krapper-default-secret-change-me'
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SessionData {
  fid: string;
  count: number;
  iat: number;
}

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

  ip = getHeader('x-forwarded-for')?.split(',')[0] || 
       getHeader('x-real-ip') || 
       getHeader('cf-connecting-ip') || 
       ('ip' in source ? (source as any).ip : null) || 
       '127.0.0.1';

  if (ip === '::1') ip = '127.0.0.1';

  ua = getHeader('user-agent') || 'unknown';
  
  const fid = btoa(`${ip}-${ua}`).substring(0, 32);
  return fid;
}

export async function checkQuota(fid: string): Promise<{ allowed: boolean; count: number }> {
  const key = `usage:${fid}`;
  const limit = 3;
  
  const currentCount = await redis.get<number>(key) || 0;
  
  if (currentCount < limit) {
    const newCount = await redis.incr(key);
    if (newCount === 1) {
      await redis.expire(key, 86400);
    }
    return { allowed: true, count: newCount };
  }
  
  return { allowed: false, count: currentCount };
}

export async function getUsage(fid: string): Promise<number> {
  const count = await redis.get<number>(`usage:${fid}`);
  return count || 0;
}

export async function createSessionToken(data: SessionData) {
  return await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionData;
  } catch (err) {
    return null;
  }
}
