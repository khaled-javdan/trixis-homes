"use client"

import { useState, type FormEvent } from "react"
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
    ...Object.fromEntries(options.map((option) => [option.value, option.label])),
  }

  return (
    <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
      <Icon className="size-5 shrink-0 text-copper" aria-hidden />
      <div className="min-w-0 flex-1 text-left">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
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
              value === ANY ? "font-normal text-ink/60" : "font-medium text-ink"
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

export function HeroSearch() {
  const router = useRouter()
  const [community, setCommunity] = useState(ANY)
  const [propertyType, setPropertyType] = useState(ANY)
  const [bedrooms, setBedrooms] = useState(ANY)
  const [maxPrice, setMaxPrice] = useState(ANY)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (community !== ANY) params.set("community", community)
    if (propertyType !== ANY) params.set("propertyType", propertyType)
    if (bedrooms !== ANY) params.set("bedrooms", bedrooms)
    if (maxPrice !== ANY) params.set("maxPrice", maxPrice)
    const query = params.toString()
    router.push(query ? `/projects?${query}` : "/projects")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 w-full max-w-4xl rounded-2xl bg-white p-2 pr-4 shadow-2xl shadow-ink-deep/30 sm:mt-10 lg:-mr-56 lg:w-[calc(100%+14rem)] lg:pr-5 xl:-mr-80 xl:w-[calc(100%+20rem)] xl:max-w-7xl xl:pr-7"
    >
      <div className="flex flex-col divide-y divide-ink/10 xl:flex-row xl:items-center xl:divide-x xl:divide-y-0">
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

        <div className="pt-2 xl:shrink-0 xl:pl-2 xl:pt-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-copper px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-copper-deep"
          >
            <Search className="size-4" aria-hidden />
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
