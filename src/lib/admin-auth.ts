/**
 * Admin authentication: one shared password (ADMIN_PASSWORD) and a signed,
 * http-only session cookie. Server-only.
 * @author Erbol king
 */
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'a3_admin';
const TTL_SECONDS = 60 * 60 * 12; // one working day

const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

/** The admin panel is disabled until a password is configured. */
export const adminEnabled = (): boolean => Boolean(process.env.ADMIN_PASSWORD);

const sha = (s: string) => crypto.createHash('sha256').update(s).digest();

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return crypto.timingSafeEqual(sha(input), sha(expected));
}

const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

export function createSession(): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = String(exp);
  return { value: `${payload}.${sign(payload)}`, maxAge: TTL_SECONDS };
}

export function verifySession(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const good = sign(payload);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  return Number(payload) > Math.floor(Date.now() / 1000);
}

/** True when the current request carries a valid admin session. */
export function isAdmin(): boolean {
  return adminEnabled() && verifySession(cookies().get(COOKIE)?.value);
}

/* ---- naive in-memory brute-force limiter (per process, per IP) ---- */
const attempts = new Map<string, { n: number; first: number }>();
const WINDOW = 10 * 60 * 1000;
const MAX = 8;

export function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.first > WINDOW) return false;
  return a.n >= MAX;
}

export function noteFailure(ip: string): void {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.first > WINDOW) attempts.set(ip, { n: 1, first: now });
  else a.n += 1;
}

export function clearFailures(ip: string): void {
  attempts.delete(ip);
}
