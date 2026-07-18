"use client"

import { useMemo } from "react"
import Link from "next/link"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { formatBRL } from "@/lib/pricing"
import type { Property } from "@/lib/types"

// Bomgo-branded pin (navy circle, price inside) instead of Leaflet's default
// marker icon — matches the site instead of looking like a generic map lib.
function priceIcon(price: number, highlighted: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${highlighted ? "#c2410c" : "#1e3a5f"};
      color:#fff;
      font-family:inherit;
      font-size:12px;
      font-weight:600;
      padding:4px 9px;
      border-radius:999px;
      box-shadow:0 2px 6px rgba(0,0,0,.25);
      white-space:nowrap;
      transform:translate(-50%,-100%);
    ">${formatBRL(price).replace(",00", "")}</div>`,
    iconSize: [0, 0],
  })
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useMemo(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length])
  return null
}

export function PropertyMap({ properties }: { properties: Property[] }) {
  const located = properties.filter(
    (p): p is Property & { latitude: number; longitude: number } =>
      typeof p.latitude === "number" && typeof p.longitude === "number",
  )

  if (located.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-md border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
        Mapa indisponível para estes imóveis no momento.
      </div>
    )
  }

  const points: [number, number][] = located.map((p) => [p.latitude, p.longitude])
  const center = points[0]

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="size-full rounded-md">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {located.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={priceIcon(property.nightlyPrice, false)}
        >
          <Popup minWidth={220}>
            <Link href={`/imovel/${property.slug}`} className="flex flex-col gap-1">
              {property.images[0] && (
                <img
                  src={property.images[0].src || "/placeholder.svg"}
                  alt={property.images[0].alt || property.name}
                  className="h-24 w-full rounded-md object-cover"
                />
              )}
              <span className="line-clamp-1 text-sm font-semibold text-foreground">{property.name}</span>
              <span className="text-xs text-muted-foreground">{property.neighborhood}</span>
              <span className="text-sm font-bold text-foreground">
                {formatBRL(property.nightlyPrice)} <span className="font-normal text-muted-foreground">/noite</span>
              </span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
