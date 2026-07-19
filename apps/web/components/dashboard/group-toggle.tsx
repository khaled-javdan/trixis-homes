"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Building2Icon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export function GroupToggle({ grouped }: { grouped: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (grouped) {
      // Grouping is the default, so opting out needs an explicit marker.
      params.set("group", "none")
    } else {
      params.delete("group")
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Button
      type="button"
      variant={grouped ? "secondary" : "outline"}
      size="sm"
      aria-pressed={grouped}
      onClick={toggle}
    >
      <Building2Icon /> Group by Community
    </Button>
  )
}
