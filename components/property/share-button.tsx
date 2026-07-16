"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ShareButton({
  title,
  url,
  label,
  className,
}: {
  title: string
  url: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`

    // Native share sheet on mobile (WhatsApp, Instagram, Mensagens etc.) —
    // exactly what makes a share button useful for this audience. Desktop
    // browsers without navigator.share fall back to copy-to-clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl })
      } catch {
        // User cancelled the native share sheet — not an error.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (rare/insecure context) — silently no-op rather
      // than showing a broken error state for a non-critical action.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartilhar"
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-105",
        className,
      )}
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {label && <span>{copied ? "Copiado!" : label}</span>}
    </button>
  )
}
