"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FilterIcon, SearchIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

import { formatProjectStatus } from "@/lib/format"

const ALL = "all"
const statusOptions = ["OFF_PLAN", "UNDER_CONSTRUCTION", "READY"] as const

export function DashboardFilters({
  developers,
  locations,
}: {
  developers: string[]
  locations: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = React.useState(searchParams.get("q") ?? "")
  const [sheetOpen, setSheetOpen] = React.useState(false)

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) {
        updateParam("q", q)
      }
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const hasActiveFilters =
    searchParams.get("developer") ||
    searchParams.get("location") ||
    searchParams.get("status") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice")

  const fields = (
    <>
      <Select
        value={searchParams.get("developer") ?? ALL}
        onValueChange={(value) => updateParam("developer", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Developer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Developers</SelectItem>
          {developers.map((developer) => (
            <SelectItem key={developer} value={developer}>
              {developer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("location") ?? ALL}
        onValueChange={(value) => updateParam("location", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? ALL}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Statuses</SelectItem>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {formatProjectStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Min price"
          defaultValue={searchParams.get("minPrice") ?? ""}
          onBlur={(event) => updateParam("minPrice", event.target.value)}
        />
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Max price"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(event) => updateParam("maxPrice", event.target.value)}
        />
      </div>
    </>
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search by name, developer, or location…"
          className="pl-8"
        />
      </div>

      <div className="hidden gap-2 sm:grid sm:grid-cols-3 lg:flex lg:w-auto">
        {fields}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" className="sm:hidden">
              <FilterIcon /> Filters {hasActiveFilters ? "•" : ""}
            </Button>
          }
        />
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">{fields}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
