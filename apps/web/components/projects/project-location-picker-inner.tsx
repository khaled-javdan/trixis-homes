"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

import { Button } from "@workspace/ui/components/button"

import { setProjectCoordinates } from "@/lib/actions/projects"

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const UAE_CENTER: [number, number] = [24.4539, 54.3773]

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

export type ProjectLocationPickerProps = {
  projectId: string
}

export default function ProjectLocationPickerInner({
  projectId,
}: ProjectLocationPickerProps) {
  const router = useRouter()
  const [position, setPosition] = React.useState<[number, number] | null>(
    null
  )
  const [pending, startTransition] = React.useTransition()

  function save() {
    if (!position) return
    startTransition(async () => {
      try {
        await setProjectCoordinates(projectId, position[0], position[1])
        toast.success("Location saved")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save location"
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t automatically detect coordinates for this location.
        Click on the map to place a pin, then save it.
      </p>
      <div className="h-[32rem] w-full overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={UAE_CENTER}
          zoom={7}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPick onPick={setPosition} />
          {position && <Marker position={position} icon={markerIcon} />}
        </MapContainer>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={!position || pending}>
          {pending ? "Saving…" : "Save Location"}
        </Button>
        {position && (
          <span className="text-xs text-muted-foreground">
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
        )}
      </div>
    </div>
  )
}
