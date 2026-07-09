"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FilterIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { MultiSelect } from "@workspace/ui/components/multi-select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Switch } from "@workspace/ui/components/switch"

import { encodeList } from "@/lib/data/filters"
import {
  formatPaymentPlanShort,
  formatProjectStatus,
  formatPropertyType,
} from "@/lib/format"
import { projectStatusValues } from "@workspace/db/validation/project"
import { propertyTypeValues } from "@workspace/db/validation/unit-type"

const bedroomOptions = [
  { value: "0", label: "Studio" },
  { value: "1", label: "1 BR" },
  { value: "2", label: "2 BR" },
  { value: "3", label: "3 BR" },
  { value: "4", label: "4 BR" },
  { value: "5", label: "5+ BR" },
]

export function DashboardFilters({
  developers,
  communities,
  cities,
  paymentPlans,
  actions,
}: {
  developers: string[]
  communities: string[]
  cities: string[]
  paymentPlans: string[]
  actions?: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = React.useState(searchParams.get("q") ?? "")
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // Rapid-fire filter changes (e.g. picking two options in a multi-select in
  // quick succession) each kick off their own async `router.replace`. Those
  // navigations can resolve out of order, letting an earlier, now-stale
  // update overwrite a later one. Debounce and merge pending changes into a
  // single navigation to avoid that race.
  const pendingParamsRef = React.useRef<Record<string, string | null>>({})
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParam(key: string, value: string | null) {
    pendingParamsRef.current[key] = value
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [pendingKey, pendingValue] of Object.entries(
        pendingParamsRef.current
      )) {
        if (!pendingValue) {
          params.delete(pendingKey)
        } else {
          params.set(pendingKey, pendingValue)
        }
      }
      pendingParamsRef.current = {}
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 200)
  }

  function updateListParam(key: string, values: string[]) {
    updateParam(key, values.length ? encodeList(values) : null)
  }

  function toggleParam(key: string, checked: boolean) {
    updateParam(key, checked ? "1" : null)
  }

  function getList(key: string): string[] {
    const raw = searchParams.get(key)
    return raw ? raw.split("|").filter(Boolean) : []
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

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "view"
  )

  function handleReset() {
    setQ("")
    setSheetOpen(false)
    router.replace(pathname, { scroll: false })
  }

  const fields = (
    <>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
        <MultiSelect
          placeholder="Developer"
          options={developers.map((d) => ({ value: d, label: d }))}
          selected={getList("developer")}
          onChange={(values) => updateListParam("developer", values)}
        />
        <MultiSelect
          placeholder="Community"
          options={communities.map((c) => ({ value: c, label: c }))}
          selected={getList("community")}
          onChange={(values) => updateListParam("community", values)}
        />
        <MultiSelect
          placeholder="City"
          options={cities.map((c) => ({ value: c, label: c }))}
          selected={getList("city")}
          onChange={(values) => updateListParam("city", values)}
        />
        <MultiSelect
          placeholder="Status"
          options={projectStatusValues.map((status) => ({
            value: status,
            label: formatProjectStatus(status),
          }))}
          selected={getList("status")}
          onChange={(values) => updateListParam("status", values)}
        />
        <MultiSelect
          placeholder="Property Type"
          options={propertyTypeValues.map((type) => ({
            value: type,
            label: formatPropertyType(type),
          }))}
          selected={getList("propertyType")}
          onChange={(values) => updateListParam("propertyType", values)}
        />
        <MultiSelect
          placeholder="Bedrooms"
          options={bedroomOptions}
          selected={getList("bedrooms")}
          onChange={(values) => updateListParam("bedrooms", values)}
        />
        <MultiSelect
          placeholder="Payment Plan"
          options={paymentPlans.map((p) => ({
            value: p,
            label: formatPaymentPlanShort(p) ?? p,
          }))}
          selected={getList("paymentPlan")}
          onChange={(values) => updateListParam("paymentPlan", values)}
        />
        <Input
          key={`minPrice-${searchParams.toString()}`}
          type="number"
          inputMode="numeric"
          placeholder="Min price"
          defaultValue={searchParams.get("minPrice") ?? ""}
          onBlur={(event) => updateParam("minPrice", event.target.value)}
        />
        <Input
          key={`maxPrice-${searchParams.toString()}`}
          type="number"
          inputMode="numeric"
          placeholder="Max price"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(event) => updateParam("maxPrice", event.target.value)}
        />
        <Input
          key={`minYear-${searchParams.toString()}`}
          type="number"
          inputMode="numeric"
          placeholder="Min year"
          defaultValue={searchParams.get("minYear") ?? ""}
          onBlur={(event) => updateParam("minYear", event.target.value)}
        />
        <Input
          key={`maxYear-${searchParams.toString()}`}
          type="number"
          inputMode="numeric"
          placeholder="Max year"
          defaultValue={searchParams.get("maxYear") ?? ""}
          onBlur={(event) => updateParam("maxYear", event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 lg:border-t lg:border-border lg:pt-2">
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Switch
            size="sm"
            checked={searchParams.get("waterfront") === "1"}
            onCheckedChange={(checked) => toggleParam("waterfront", checked)}
          />
          Waterfront
        </label>
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Switch
            size="sm"
            checked={searchParams.get("golf") === "1"}
            onCheckedChange={(checked) => toggleParam("golf", checked)}
          />
          Golf
        </label>
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Switch
            size="sm"
            checked={searchParams.get("branded") === "1"}
            onCheckedChange={(checked) => toggleParam("branded", checked)}
          />
          Branded
        </label>
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Switch
            size="sm"
            checked={searchParams.get("promotion") === "1"}
            onCheckedChange={(checked) => toggleParam("promotion", checked)}
          />
          Promotion Active
        </label>
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Switch
            size="sm"
            checked={searchParams.get("available") === "1"}
            onCheckedChange={(checked) => toggleParam("available", checked)}
          />
          Only Available Units
        </label>
      </div>
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs lg:max-w-md">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search by name, developer, or location…"
              className="pl-8"
            />
          </div>

          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={handleReset}
            >
              <XIcon /> Reset
            </Button>
          ) : null}

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" className="lg:hidden">
                  <FilterIcon /> Filters {hasActiveFilters ? "•" : ""}
                </Button>
              }
            />
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4 pb-4">
                {fields}
                {hasActiveFilters ? (
                  <Button variant="ghost" onClick={handleReset}>
                    <XIcon /> Reset filters
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:rounded-lg lg:border lg:border-border lg:bg-muted/30 lg:p-2">
        {fields}
      </div>
    </div>
  )
}
