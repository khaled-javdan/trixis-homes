"use client"

import * as React from "react"
import { ArrowLeftIcon, LayoutGridIcon } from "lucide-react"

// Floating "Back to admin" pill, shown only to signed-in dashboard staff.
// The session is checked client-side (after mount) so public pages stay
// statically cacheable — ordinary visitors just never see it.
//
// Sits bottom-LEFT to stay clear of the WhatsApp float on the right.

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000"

export function AdminBar() {
  const [staff, setStaff] = React.useState<{ name: string } | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch("/api/admin-session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.signedIn) setStaff({ name: data.name })
      })
      .catch(() => {
        // Never surface an error to visitors — the bar simply stays hidden.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!staff) return null

  return (
    <a
      href={ADMIN_URL}
      aria-label="Back to the admin dashboard"
      className="group fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full bg-neutral-900/90 py-2.5 pl-3 pr-4 text-white shadow-lg shadow-black/20 backdrop-blur-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none sm:bottom-6 sm:left-6"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15">
        <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
          <LayoutGridIcon className="size-3" />
          Back to admin
        </span>
        <span className="text-[10px] text-white/60">
          Signed in as {staff.name}
        </span>
      </span>
    </a>
  )
}
