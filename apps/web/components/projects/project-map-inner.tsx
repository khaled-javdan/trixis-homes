"use client"

import "leaflet/dist/leaflet.css"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MapPinIcon, Maximize2Icon, Minimize2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"
import L from "leaflet"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet"

import { Button } from "@workspace/ui/components/button"

import { useIsAdmin } from "@/components/admin-provider"
import { LocationSearchInput } from "@/components/projects/location-search-input"
import { setProjectCoordinates } from "@/lib/actions/projects"

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export type ProjectMapProps = {
  projectId: string
  name: string
  location: string
  latitude: number
  longitude: number
}

function ClickToPick({
  onPick,
}: {
  onPick: (position: [number, number]) => void
}) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}

export default function ProjectMapInner({
  projectId,
  name,
  location,
  latitude,
  longitude,
}: ProjectMapProps) {
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pendingPosition, setPendingPosition] = useState<
    [number, number] | null
  >(null)
  const [saving, startTransition] = useTransition()

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
      setTimeout(() => mapRef.current?.invalidateSize(), 100)
    }
    document.addEventListener("fullscreenchange", handleChange)
    return () => document.removeEventListener("fullscreenchange", handleChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const startEditing = () => {
    setPendingPosition([latitude, longitude])
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setPendingPosition(null)
  }

  const saveLocation = () => {
    if (!pendingPosition) return
    startTransition(async () => {
      try {
        await setProjectCoordinates(
          projectId,
          pendingPosition[0],
          pendingPosition[1]
        )
        toast.success("Location updated")
        setIsEditing(false)
        setPendingPosition(null)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save location"
        )
      }
    })
  }

  const markerPosition: [number, number] = isEditing && pendingPosition
    ? pendingPosition
    : [latitude, longitude]

  function handleSearchSelect(result: { latitude: number; longitude: number }) {
    const next: [number, number] = [result.latitude, result.longitude]
    setPendingPosition(next)
    mapRef.current?.flyTo(next, 15)
  }

  return (
    <div
      ref={containerRef}
      className="relative isolate h-[32rem] w-full overflow-hidden rounded-lg border border-border [&:fullscreen]:h-screen [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
    >
      {isEditing && (
        <div className="absolute top-2 left-2 z-[1000] w-72 max-w-[calc(100%-1rem)]">
          <LocationSearchInput
            onSelect={handleSearchSelect}
            className="[&_input]:bg-background/95 [&_input]:shadow-md [&_input]:backdrop-blur-sm"
          />
        </div>
      )}
      <div className="absolute top-2 right-2 z-[1000] flex items-center gap-2">
        {isEditing ? (
          <>
            <span className="hidden rounded-md bg-background/85 px-2 py-1 text-xs text-muted-foreground shadow-md backdrop-blur-sm sm:inline">
              Search or click the map to move the pin
            </span>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={cancelEditing}
              disabled={saving}
              className="shadow-md"
              aria-label="Cancel"
            >
              <XIcon className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveLocation}
              disabled={saving}
              className="shadow-md"
            >
              {saving ? "Saving…" : "Save location"}
            </Button>
          </>
        ) : (
          <>
            {isAdmin && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={startEditing}
                className="shadow-md"
                aria-label="Edit location"
              >
                <MapPinIcon className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={toggleFullscreen}
              className="shadow-md"
              aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2Icon className="size-4" />
              ) : (
                <Maximize2Icon className="size-4" />
              )}
            </Button>
          </>
        )}
      </div>
      <MapContainer
        ref={mapRef}
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        className={`h-full w-full ${isEditing ? "cursor-crosshair" : ""}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isEditing && <ClickToPick onPick={setPendingPosition} />}
        <Marker position={markerPosition} icon={markerIcon}>
          {!isEditing && (
            <Popup>
              <span className="font-medium">{name}</span>
              <br />
              {location}
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  )
}
