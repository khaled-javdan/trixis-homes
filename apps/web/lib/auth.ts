import "server-only"

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

import { prisma, type UserRole } from "@workspace/db"

export const SESSION_COOKIE = "trixis_admin_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

/**
 * Cookie attributes for the session. Set SESSION_COOKIE_DOMAIN (e.g.
 * ".trixishomes.com") in production so the public marketing site on a sibling
 * host can read the session and show its "Back to admin" bar. Left unset in
 * dev, where localhost:3000 and :3001 already share cookies (ports are ignored).
 */
export function sessionCookieOptions() {
  const domain = process.env.SESSION_COOKIE_DOMAIN
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(domain ? { domain } : {}),
  }
}

function getSecret(): string | null {
  // A dedicated AUTH_SECRET survives password rotations without logging
  // everyone out; falling back to the password keeps setup to one env var.
  return process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? null
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

// --- Password hashing (scrypt, Node built-in — no extra dependency) ----------
// Stored format: `scrypt:<saltHex>:<derivedHex>`. Keep this in sync with the
// seed script (packages/db/prisma/seed-users.ts), which produces the same shape.

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, 64)
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split(":")
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false
  const derived = scryptSync(password, Buffer.from(saltHex, "hex"), 64)
  const expected = Buffer.from(hashHex, "hex")
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

// --- Sessions ----------------------------------------------------------------
// The token carries the user id so each person has their own session:
// `<userId>.<expiresAt>.<signature>`. Signed with the shared HMAC secret.

export function createSessionToken(userId: string): string {
  const secret = getSecret()
  if (!secret) throw new Error("AUTH_SECRET/ADMIN_PASSWORD is not configured")
  const payload = `${userId}.${Date.now() + SESSION_MAX_AGE_SECONDS * 1000}`
  return `${payload}.${sign(payload, secret)}`
}

function readTokenUserId(token: string): string | null {
  const secret = getSecret()
  if (!secret) return null
  const [userId, expiresAt, signature] = token.split(".")
  if (!userId || !expiresAt || !signature) return null
  const payload = `${userId}.${expiresAt}`
  if (!safeEqual(signature, sign(payload, secret))) return null
  if (!(Number(expiresAt) > Date.now())) return null
  return userId
}

export type Session = {
  userId: string
  role: UserRole
  name: string | null
  email: string
  avatarUrl: string | null
}

/**
 * The signed-in user, or null. Verifies the cookie signature/expiry, then
 * confirms the account still exists and is active (so disabling a member takes
 * effect immediately, even if their cookie is still valid).
 */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  const userId = readTokenUserId(token)
  if (!userId) return null

  const user = await prisma.user.findUnique({ where: { id: userId } })
  // INVITED users are valid (they log in with a temp password); only DISABLED
  // accounts are locked out.
  if (!user || user.status === "DISABLED") return null

  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  }
}

/** Guard for self-service actions any signed-in member may perform (their own
 * profile, password, avatar upload). */
export async function requireUser(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error("Sign-in required")
  return session
}

/**
 * True when the viewer is an OWNER — the "admin" tier. Members are viewers:
 * they browse the catalog but don't manage it, so admin pages and edit
 * affordances gate on this.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getSession())?.role === "OWNER"
}

/** Guard for admin/owner-only server actions, pages, and API routes. */
export async function requireAdmin(): Promise<Session> {
  return requireOwner()
}

/** Guard for owner-only actions (same as requireAdmin; kept for clarity at
 * member-management call sites). */
export async function requireOwner(): Promise<Session> {
  const session = await getSession()
  if (!session || session.role !== "OWNER") {
    throw new Error("Owner access required")
  }
  return session
}
