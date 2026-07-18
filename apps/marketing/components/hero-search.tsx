"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  BedDouble,
  Home,
  MapPin,
  Search,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

import { communities } from "@/lib/content"
import { formatPriceShort } from "@/lib/format"

// Maps to the public projects page filter contract (/projects, which parses
// community | propertyType | bedrooms | maxPrice). The "any" sentinel means
// the field is unset and is omitted from the query, so the visitor lands on
// the listing pre-filtered by whatever they actually chose.
const ANY = "any"

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "PENTHOUSE", label: "Penthouse" },
  { value: "DUPLEX", label: "Duplex" },
]

const bedroomOptions = [
  { value: "0", label: "Studio" },
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4", label: "4 Bedrooms" },
  { value: "5|6|7|8", label: "5+ Bedrooms" },
]

const budgetOptions = [
  { value: "1000000", label: "Up to AED 1M" },
  { value: "2000000", label: "Up to AED 2M" },
  { value: "3000000", label: "Up to AED 3M" },
  { value: "5000000", label: "Up to AED 5M" },
  { value: "10000000", label: "Up to AED 10M" },
]

function Field({
  icon: Icon,
  label,
  value,
  onValueChange,
  neutralLabel,
  options,
}: {
  icon: LucideIcon
  label: string
  value: string
  onValueChange: (value: string) => void
  neutralLabel: string
  options: { value: string; label: string }[]
}) {
  // Base UI's SelectValue renders the raw value unless it can resolve a label
  // from `items`; this map (including the neutral "any" entry) makes the
  // trigger show the selected option's label by default.
  const items = {
    [ANY]: neutralLabel,
    ...Object.fromEntries(
      options.map((option) => [option.value, option.label])
    ),
  }

  return (
    <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
      <Icon className="text-copper size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 text-left">
        <span className="text-ink/45 block text-[10px] font-semibold tracking-[0.12em] uppercase">
          {label}
        </span>
        <Select
          items={items}
          value={value}
          onValueChange={(next) => onValueChange(next ?? ANY)}
        >
          <SelectTrigger
            aria-label={label}
            className={cn(
              "h-auto w-full min-w-0 gap-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent",
              value === ANY ? "text-ink/60 font-normal" : "text-ink font-medium"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{neutralLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

type SearchStats = { count: number; minPrice: number | null }

export function HeroSearch() {
  const router = useRouter()
  const [community, setCommunity] = useState(ANY)
  const [propertyType, setPropertyType] = useState(ANY)
  const [bedrooms, setBedrooms] = useState(ANY)
  const [maxPrice, setMaxPrice] = useState(ANY)
  // Stored with the query it answered so a stale count is never shown
  // against a newer filter selection.
  const [result, setResult] = useState<{
    query: string
    stats: SearchStats
  } | null>(null)

  const hasFilters =
    community !== ANY ||
    propertyType !== ANY ||
    bedrooms !== ANY ||
    maxPrice !== ANY

  function buildQuery() {
    const params = new URLSearchParams()
    if (community !== ANY) params.set("community", community)
    if (propertyType !== ANY) params.set("propertyType", propertyType)
    if (bedrooms !== ANY) params.set("bedrooms", bedrooms)
    if (maxPrice !== ANY) params.set("maxPrice", maxPrice)
    return params.toString()
  }

  // Live feedback under the card: as soon as the visitor narrows anything,
  // tell them how many real projects match and from what price. Debounced,
  // and silently keeps the last answer on failure — this line must never
  // surface an error.
  const query = hasFilters ? buildQuery() : null
  useEffect(() => {
    if (query == null) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/count?${query}`, {
          signal: controller.signal,
        })
        if (response.ok) setResult({ query, stats: await response.json() })
      } catch {
        // Aborted by a newer selection, or offline — the line just stays
        // empty; it must never surface an error.
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const search = buildQuery()
    router.push(search ? `/projects?${search}` : "/projects")
  }

  const typeLabel = propertyTypes.find((t) => t.value === propertyType)?.label
  const stats = result && result.query === query ? result.stats : null

  let feedback: string | null = null
  if (hasFilters && stats) {
    if (stats.count === 0) {
      feedback =
        "No exact matches yet — our advisors often have off-market options."
    } else {
      const noun = typeLabel
        ? `${typeLabel.toLowerCase()} project${stats.count === 1 ? "" : "s"}`
        : `project${stats.count === 1 ? "" : "s"}`
      const where = community !== ANY ? ` in ${community}` : ""
      const from =
        stats.minPrice != null
          ? ` · from ${formatPriceShort(stats.minPrice)}`
          : ""
      feedback = `${stats.count} ${noun}${where}${from}`
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="shadow-ink-deep/30 mt-8 w-full max-w-4xl rounded-2xl bg-white p-2 pr-4 shadow-2xl sm:mt-10 lg:pr-5 xl:max-w-5xl xl:pr-6"
      >
        <div className="divide-ink/10 flex flex-col divide-y xl:flex-row xl:items-center xl:divide-x xl:divide-y-0">
          <Field
            icon={MapPin}
            label="Location"
            value={community}
            onValueChange={setCommunity}
            neutralLabel="Any location"
            options={communities.map((name) => ({ value: name, label: name }))}
          />
          <Field
            icon={Home}
            label="Property type"
            value={propertyType}
            onValueChange={setPropertyType}
            neutralLabel="Any type"
            options={propertyTypes}
          />
          <Field
            icon={BedDouble}
            label="Bedrooms"
            value={bedrooms}
            onValueChange={setBedrooms}
            neutralLabel="Any"
            options={bedroomOptions}
          />
          <Field
            icon={Wallet}
            label="Max budget"
            value={maxPrice}
            onValueChange={setMaxPrice}
            neutralLabel="No max"
            options={budgetOptions}
          />

          <div className="pt-2 xl:shrink-0 xl:pt-0 xl:pl-2">
            <button
              type="submit"
              className="bg-copper hover:bg-copper-deep flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-colors"
            >
              <Search className="size-4" aria-hidden />
              Search
            </button>
          </div>
        </div>
      </form>

      {/* min-h reserves the row so appearing feedback never shifts the CTAs. */}
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-white/75">
        {feedback ? (
          <>
            <span
              className="bg-copper mr-2 inline-block size-1.5 rounded-full align-middle"
              aria-hidden
            />
            {feedback}
          </>
        ) : null}
      </p>
    </>
  )
}
