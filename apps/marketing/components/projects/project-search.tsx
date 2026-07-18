"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

// Preserves any active filters (developer | community | propertyType |
// bedrooms | maxPrice) already in the URL while setting/clearing `search`.
export function ProjectSearch({
  params,
}: {
  params: Record<string, string | undefined>
}) {
  const router = useRouter()
  const [value, setValue] = useState(params.search ?? "")

  function go(nextSearch: string) {
    const query = new URLSearchParams()
    for (const [key, val] of Object.entries(params)) {
      if (val && key !== "search") query.set(key, val)
    }
    const trimmed = nextSearch.trim()
    if (trimmed) query.set("search", trimmed)
    const qs = query.toString()
    router.push(qs ? `/projects?${qs}` : "/projects")
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    go(value)
  }

  function handleClear() {
    setValue("")
    go("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-xl shadow-ink-deep/30"
    >
      <Search className="size-5 shrink-0 text-copper" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search projects, developers, areas, or unit types…"
        aria-label="Search projects"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="grid size-8 shrink-0 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
      <button
        type="submit"
        className="flex shrink-0 items-center gap-2 rounded-full bg-copper px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-copper-deep"
      >
        <Search className="size-4 sm:hidden" aria-hidden />
        <span className="max-sm:sr-only">Search</span>
      </button>
    </form>
  )
}
