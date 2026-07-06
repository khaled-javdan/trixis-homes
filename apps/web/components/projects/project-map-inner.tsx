"use client"

import "leaflet/dist/leaflet.css"

import { useEffect, useRef, useState } from "react"
import { Maximize2Icon, Minimize2Icon } from "lucide-react"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

import { Button } from "@workspace/ui/components/button"

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
  name: string
  location: string
  latitude: number
  longitude: number
}

export default function ProjectMapInner({
  name,
  location,
  latitude,
  longitude,
}: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  return (
    <div
      ref={containerRef}
      className="relative isolate h-[32rem] w-full overflow-hidden rounded-lg border border-border [&:fullscreen]:h-screen [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
    >
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-[1000] shadow-md"
        aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2Icon className="size-4" />
        ) : (
          <Maximize2Icon className="size-4" />
        )}
      </Button>
      <MapContainer
        ref={mapRef}
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <span className="font-medium">{name}</span>
            <br />
            {location}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
