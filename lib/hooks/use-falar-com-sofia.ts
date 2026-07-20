"use client"

import { useCallback } from "react"
import { useApp } from "@/components/providers/app-providers"

const SOFIA_WHATSAPP_URL = "https://wa.me/558581412023"
// Matches the site's `md:` Tailwind breakpoint — same width used everywhere
// else to distinguish "has room for the on-page chat widget" from mobile.
const DESKTOP_QUERY = "(min-width: 768px)"

/**
 * Desktop: opens the Sofia chat widget already embedded on this page.
 * Mobile: opens WhatsApp directly instead — there's no room for a floating
 * chat panel there, and WhatsApp is how mobile guests already reach Sofia.
 */
export function useFalarComSofia() {
  const { openSofia } = useApp()

  return useCallback(() => {
    const isDesktop = typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
    if (isDesktop) {
      openSofia()
    } else {
      window.open(SOFIA_WHATSAPP_URL, "_blank", "noopener,noreferrer")
    }
  }, [openSofia])
}
