"use client"

import { Suspense, lazy, useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

import type { LocationMapProps } from "@workspace/ui/components/location-map-inner"
import { cn } from "@workspace/ui/lib/utils"

// Leaflet + tiles only load once the map scrolls near the viewport, so pages
// that embed it (e.g. a project detail page) don't pay for the map JS upfront.
const LocationMapInner = lazy(
  () => import("@workspace/ui/components/location-map-inner")
)

export type { LocationMapProps }

function MapPlaceholder() {
  return (
    <div className="flex size-full items-center justify-center bg-black/[0.04]">
      <MapPin className="size-8 text-black/25" aria-hidden />
    </div>
  )
}

/** Read-only project location map. Reuse this anywhere a pin on a map is
 * needed; it is the single shared map for public/display surfaces. Give it a
 * height via `className` (e.g. `h-80`). Callers should check
 * `hasMapTilerKey()` and render a text fallback when it returns false. */
export function LocationMap({
  className,
  ...props
}: LocationMapProps & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setShow(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShow(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn("relative isolate overflow-hidden", className)}>
      {show ? (
        <Suspense fallback={<MapPlaceholder />}>
          <LocationMapInner {...props} />
        </Suspense>
      ) : (
        <MapPlaceholder />
      )}
    </div>
  )
}
