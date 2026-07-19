import { NextResponse, type NextRequest } from "next/server"

// Gates the entire dashboard: every request needs a valid session cookie.
// Only the auth pages and static assets are reachable while logged out. This
// verifies the cookie's HMAC signature + expiry (no DB — runs on the edge); the
// DB-backed active-user check still happens in getSession() on each page/action.

const SESSION_COOKIE = "trixis_admin_session"

// Reachable without a session.
const PUBLIC_PATHS = ["/login", "/reset-password", "/forgot-password"]

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true
  }
  // Static files served from /public (logo, images, fonts, etc.).
  return /\.(?:svg|png|jpe?g|gif|webp|ico|css|js|txt|woff2?|map)$/i.test(pathname)
}

function base64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function isValidToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".")
  if (parts.length !== 3) return false
  const [userId, expiresAt, signature] = parts
  if (!userId || !expiresAt || !signature) return false
  if (!(Number(expiresAt) > Date.now())) return false

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${userId}.${expiresAt}`)
  )
  return base64url(mac) === signature
}

function passThrough(request: NextRequest) {
  // Expose the path so the root layout can enforce the DB-backed check
  // (e.g. redirect a disabled user whose cookie is still validly signed).
  const headers = new Headers(request.headers)
  headers.set("x-pathname", request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) return passThrough(request)

  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const authed =
    !!secret && !!token && (await isValidToken(token, secret))

  if (authed) return passThrough(request)

  // API routes get a 401 rather than an HTML redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Run on everything except Next internals (public assets are handled above so
  // the file-extension allowlist can let them through).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
