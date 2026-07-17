"use client"

import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"

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
  value,
  onValueChange,
  neutralLabel,
  options,
}: {
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
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onValueChange(next ?? ANY)}
    >
      <SelectTrigger
        className={cn(
          "h-auto w-full min-w-0 border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent",
          value === ANY ? "text-ink/55" : "text-ink"
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
      className="mt-10 w-full max-w-4xl rounded-2xl bg-white p-2 shadow-2xl shadow-ink-deep/30"
    >
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_auto] xl:items-center xl:divide-x xl:divide-ink/10">
        <Field
          value={community}
          onValueChange={setCommunity}
          neutralLabel="Any location"
          options={communities.map((name) => ({ value: name, label: name }))}
        />
        <Field
          value={propertyType}
          onValueChange={setPropertyType}
          neutralLabel="Property type"
          options={propertyTypes}
        />
        <Field
          value={bedrooms}
          onValueChange={setBedrooms}
          neutralLabel="Bedrooms"
          options={bedroomOptions}
        />
        <Field
          value={maxPrice}
          onValueChange={setMaxPrice}
          neutralLabel="Max budget"
          options={budgetOptions}
        />

        <button
          type="submit"
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-copper px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-copper-deep sm:col-span-2 xl:col-span-1 xl:mt-0 xl:rounded-lg"
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </div>
    </form>
  )
}
