"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutGridIcon, ListIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export type DashboardView = "grid" | "list"

export function ViewToggle({ view }: { view: DashboardView }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(next: DashboardView) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "list") {
      params.delete("view")
    } else {
      params.set("view", next)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => setView("grid")}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-colors",
          view === "grid"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGridIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => setView("list")}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-colors",
          view === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ListIcon className="size-4" />
      </button>
    </div>
  )
}
