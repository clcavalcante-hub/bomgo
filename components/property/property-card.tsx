"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Bath, BedDouble, Heart, MapPin, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "@/components/property/share-button"
import { useApp } from "@/components/providers/app-providers"
import { badgeConfig } from "@/lib/config"
import { formatBRL } from "@/lib/pricing"
import type { Property } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PropertyCard({
  property,
  className,
  priority = false,
}: {
  property: Property
  className?: string
  priority?: boolean
}) {
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useApp()
  const favorite = isFavorite(property.id)
  const primaryBadge = property.badges[0]
  const href = `/imovel/${property.slug}`
  const photos = property.images.length ? property.images : [{ src: "/placeholder.svg", alt: property.name }]

  // Swipe through the card's own photos in place — no navigation, no
  // lightbox. A tap (no meaningful drag) still opens the property, since
  // this layer sits above the whole-card link.
  const [photoIndex, setPhotoIndex] = useState(0)

  // Preload all of this card's photos (optimized/small, not full-res) so
  // swiping between them feels instant instead of each new photo starting
  // to download only once swiped to.
  useEffect(() => {
    photos.forEach((img) => {
      if (!img.src) return
      const preload = new window.Image()
      preload.src = `/_next/image?url=${encodeURIComponent(img.src)}&w=640&q=75`
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const dragStartX = useRef<number | null>(null)
  const draggedRef = useRef(false)
  const SWIPE_THRESHOLD = 30

  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX
    draggedRef.current = false
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStartX.current == null) return
    if (Math.abs(e.clientX - dragStartX.current) > 8) draggedRef.current = true
  }
  function onPointerUp(e: React.PointerEvent) {
    if (dragStartX.current == null) return
    const delta = e.clientX - dragStartX.current
    dragStartX.current = null

    if (Math.abs(delta) > SWIPE_THRESHOLD && photos.length > 1) {
      if (delta > 0) setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
      else setPhotoIndex((i) => (i + 1) % photos.length)
      return
    }
    if (!draggedRef.current) router.push(href)
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5",
        className,
      )}
    >
      {/* Whole-card link overlay — fallback for keyboard/no-JS navigation.
          The photo area above it captures pointer events directly (see
          onPointerUp) so a tap still opens the property while a drag swipes
          photos instead of navigating. */}
      <Link href={href} className="absolute inset-0 z-10" aria-label={property.name} tabIndex={-1} />

      <div
        className="relative aspect-[4/3] touch-pan-y select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ zIndex: 15 }}
      >
        <Image
          src={photos[photoIndex].src || "/placeholder.svg"}
          alt={photos[photoIndex].alt || property.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          draggable={false}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {primaryBadge && (
          <div className="absolute left-3 top-3">
            <Badge tone={badgeConfig[primaryBadge].tone} className="shadow-sm">
              {badgeConfig[primaryBadge].label}
            </Badge>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-20 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(property.id)
          }}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={favorite}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur transition hover:scale-105"
        >
          <Heart className={cn("size-5", favorite ? "fill-cta text-cta" : "text-foreground")} />
        </button>
        <ShareButton
          title={property.name}
          url={href}
          className="pointer-events-auto size-9 rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur hover:scale-105"
        />
      </div>

      <div className="pointer-events-none relative flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs font-normal text-foreground/80">
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{property.neighborhood}</span>
          {property.rating > 0 && property.reviewsCount > 0 && (
            <>
              <span className="mx-1 text-muted-foreground/50">·</span>
              <span className="inline-flex items-center gap-0.5 text-foreground">
                <Star className="size-3.5 fill-gold text-gold" />
                <span className="font-medium">{property.rating.toFixed(1)}</span>
              </span>
            </>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-1 font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {property.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{property.highlight ?? property.summary}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-foreground/80">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 text-primary" /> {property.maxGuests} hóspedes
          </span>
          <span className="inline-flex items-center gap-1">
            <BedDouble className="size-3.5 text-primary" /> {property.bedrooms} quartos
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="size-3.5 text-primary" /> {property.bathrooms} banheiros
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xs text-muted-foreground">a partir de</p>
            <p className="text-lg font-bold text-foreground">
              {formatBRL(property.nightlyPrice)}
              <span className="text-xs font-normal text-muted-foreground"> /noite</span>
            </p>
          </div>
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            Ver detalhes
          </span>
        </div>
      </div>
    </article>
  )
}
