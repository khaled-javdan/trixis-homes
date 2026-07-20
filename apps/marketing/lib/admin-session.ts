import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

import { prisma } from "@workspace/db"

// Recognises a signed-in staff session from the dashboard app so the public
// site can show its "Back to admin" bar. Verification mirrors
// apps/web/lib/auth.ts (token = `<userId>.<expiresAt>.<hmacSignature>`) — keep
// the two in sync.
//
// Requires AUTH_SECRET (or ADMIN_PASSWORD) to match the dashboard app. The
// cookie only reaches this app when the two share a domain: automatic in dev
// (localhost ignores ports), and in production via SESSION_COOKIE_DOMAIN.

const SESSION_COOKIE = "trixis_admin_session"

function getSecret(): string | null {
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

export type StaffSession = {
  name: string
  role: "OWNER" | "MEMBER"
}

/** The signed-in dashboard user, or null for ordinary visitors. */
export async function getStaffSession(): Promise<StaffSession | null> {
  const secret = getSecret()
  if (!secret) return null

  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null

  const [userId, expiresAt, signature] = token.split(".")
  if (!userId || !expiresAt || !signature) return null
  if (!safeEqual(signature, sign(`${userId}.${expiresAt}`, secret))) return null
  if (!(Number(expiresAt) > Date.now())) return null

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status === "DISABLED") return null

  return { name: user.name ?? user.email, role: user.role }
}
