import { NextResponse } from "next/server"

import { getStaffSession } from "@/lib/admin-session"

// Read by the client-side AdminBar. Keeping the check here (rather than in the
// root layout) means the public pages stay statically cacheable — only this
// tiny endpoint is per-request.
export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getStaffSession()

  return NextResponse.json(
    session
      ? { signedIn: true, name: session.name, role: session.role }
      : { signedIn: false },
    { headers: { "Cache-Control": "no-store" } }
  )
}
