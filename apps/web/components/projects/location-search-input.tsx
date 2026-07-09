"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"

import { searchLocationSuggestions } from "@/lib/actions/geocode"
import type { GeoSearchResult } from "@/lib/geocode"

export function LocationSearchInput({
  onSelect,
  placeholder = "Search for a location…",
  className,
}: {
  onSelect: (result: GeoSearchResult) => void
  placeholder?: string
  className?: string
}) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<GeoSearchResult[]>([])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = React.useRef(0)

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const found = await searchLocationSuggestions(value)
      if (requestId !== requestIdRef.current) return
      setResults(found)
      setOpen(true)
      setLoading(false)
    }, 400)
  }

  return (
    <div className={className}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-8"
        />
        {open && (
          <div className="absolute top-full right-0 left-0 z-[1200] mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
            {loading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Searching…
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No matches found.
              </p>
            ) : (
              results.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    onSelect(result)
                    setQuery(result.label)
                    setOpen(false)
                  }}
                >
                  {result.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
