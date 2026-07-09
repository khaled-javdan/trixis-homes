"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const ALL_CITIES = "__all__"

export function CommunityCityFilter({ cities }: { cities: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selected = searchParams.get("city") ?? ALL_CITIES

  function setCity(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL_CITIES) {
      params.delete("city")
    } else {
      params.set("city", value)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Select value={selected} onValueChange={setCity}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CITIES}>All Cities</SelectItem>
        {cities.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
