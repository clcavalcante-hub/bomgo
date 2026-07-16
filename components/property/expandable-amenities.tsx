"use client"

import { useState } from "react"
import { AmenityIcon } from "@/components/property/amenity-icon"
import type { Property } from "@/lib/types"

export function ExpandableAmenities({
  amenities,
  limit = 10,
}: {
  amenities: Property["amenities"]
  limit?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? amenities : amenities.slice(0, limit)
  const hasMore = amenities.length > limit

  return (
    <div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visible.map((a) => (
          <div key={a.key} className="flex items-center gap-3 text-sm font-medium text-foreground">
            <span className="flex size-10 items-center justify-center rounded-md bg-secondary">
              <AmenityIcon amenityKey={a.key} label={a.label} className="size-5 text-foreground" />
            </span>
            {a.label}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          {expanded ? "Ver menos" : `Ver mais (${amenities.length - limit})`}
        </button>
      )}
    </div>
  )
}
