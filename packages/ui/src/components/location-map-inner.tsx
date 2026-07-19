"use client"

import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

import { MAPTILER_ATTRIBUTION, maptilerTileUrl } from "@workspace/ui/lib/maptiler"

export type LocationMapProps = {
  latitude: number
  longitude: number
  /** Bold first line of the marker popup, e.g. the project name. */
  title: string
  /** Optional second line, e.g. the human-readable address. */
  subtitle?: string
  zoom?: number
}

// Copper pin (#CD6024) drawn inline so the map never fetches marker assets
// from an external CDN.
const markerIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 0.5C6.99 0.5 0.5 6.99 0.5 15c0 10.2 12.75 25.06 13.29 25.69a1.6 1.6 0 0 0 2.42 0C16.75 40.06 29.5 25.2 29.5 15 29.5 6.99 23.01 0.5 15 0.5Z" fill="#CD6024" stroke="#fff" stroke-width="1"/><circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
})

export default function LocationMapInner({
  latitude,
  longitude,
  title,
  subtitle,
  zoom = 12,
}: LocationMapProps) {
  const position: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={false}
      className="size-full"
    >
      <TileLayer
        attribution={MAPTILER_ATTRIBUTION}
        url={maptilerTileUrl()}
        detectRetina
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>
          <span className="font-medium">{title}</span>
          {subtitle ? (
            <>
              <br />
              {subtitle}
            </>
          ) : null}
        </Popup>
      </Marker>
    </MapContainer>
  )
}
