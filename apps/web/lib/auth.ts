import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "trixis_admin_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

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

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(password, expected)
}

export function createSessionToken(): string {
  const secret = getSecret()
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured")
  const payload = `admin.${Date.now() + SESSION_MAX_AGE_SECONDS * 1000}`
  return `${payload}.${sign(payload, secret)}`
}

function verifySessionToken(token: string): boolean {
  const secret = getSecret()
  if (!secret) return false
  const [scope, expiresAt, signature] = token.split(".")
  if (!scope || !expiresAt || !signature) return false
  const payload = `${scope}.${expiresAt}`
  if (!safeEqual(signature, sign(payload, secret))) return false
  return scope === "admin" && Number(expiresAt) > Date.now()
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return token ? verifySessionToken(token) : false
}

/** Guard for mutating server actions and API routes. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Admin access required")
  }
}
