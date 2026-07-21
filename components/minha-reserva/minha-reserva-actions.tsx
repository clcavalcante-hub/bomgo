"use client"

import { useState } from "react"
import Link from "next/link"
import { Info, ShieldCheck } from "lucide-react"
import { WelcomeGuide } from "@/components/property/welcome-guide"

interface MinhaReservaActionsProps {
  propertyName: string | null
  propertyLocation: string | null
  propertyFullAddress: string | null
  propertyHouseRules: string[]
  propertyAmenities: { key: string; label: string }[]
  propertyImages: { src: string; alt: string }[]
  checkInDate: string | null
  checkOutDate: string | null
  status: string | null
  checkinInfo: {
    checkInTime: string
    checkOutTime: string
    access: string
    doorPassword: string
    wifiNetwork: string
    wifiPassword: string
    parking: string
  } | null
}

export function MinhaReservaActions({
  propertyName,
  propertyLocation,
  propertyFullAddress,
  propertyHouseRules,
  propertyAmenities,
  propertyImages,
  checkInDate,
  checkOutDate,
  status,
  checkinInfo,
}: MinhaReservaActionsProps) {
  const [guideOpen, setGuideOpen] = useState(false)
  // Same rule as the logged-in account page: sensitive access info (senha,
  // wifi, chave) only shown once the stay is actually confirmed — a booked
  // OTA reservation is the closest equivalent to "confirmed".
  const canShowCheckinInfo = status === "booked"

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!canShowCheckinInfo}
          onClick={() => setGuideOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-xs font-medium text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:border-transparent disabled:bg-secondary disabled:text-muted-foreground"
        >
          <Info className="size-3.5" /> Instruções de check-in
        </button>
        <Link
          href="/cancelamento"
          target="_blank"
          className="flex items-center justify-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-xs font-medium text-foreground transition hover:border-primary"
        >
          <ShieldCheck className="size-3.5" /> Política de cancelamento
        </Link>
      </div>

      {guideOpen && (
        <WelcomeGuide
          reservation={{
            propertyName,
            propertyLocation,
            propertyFullAddress,
            propertyHouseRules,
            propertyAmenities,
            propertyImages,
            checkInDate: checkInDate ?? "",
            checkOutDate: checkOutDate ?? "",
            checkinInfo,
          }}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </>
  )
}
