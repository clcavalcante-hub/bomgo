"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Star, Users } from "lucide-react"
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
  const { isFavorite, toggleFavorite } = useApp()
  const favorite = isFavorite(property.id)
  const primaryBadge = property.badges[0]
  const href = `/imovel/${property.slug}`

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5",
        className,
      )}
    >
      {/* Whole-card link overlay — sits ABOVE the photo/content (but below
          the favorite/share buttons, which have their own higher z-index +
          stopPropagation) so clicking anywhere on the card opens the
          property, not just the photo like before. */}
      <Link href={href} className="absolute inset-0 z-10" aria-label={property.name} />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]?.src || "/placeholder.svg"}
          alt={property.images[0]?.alt || property.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
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
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-105"
        >
          <Heart className={cn("size-5", favorite ? "fill-cta text-cta" : "text-primary-foreground")} />
        </button>
        <ShareButton title={property.name} url={href} className="pointer-events-auto size-9 rounded-full" />
      </div>

      <div className="pointer-events-none relative flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

        <h3 className="mt-1.5 line-clamp-1 font-serif text-lg font-medium text-foreground transition-colors group-hover:text-primary">
          {property.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{property.highlight ?? property.summary}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {property.maxGuests} hóspedes
          </span>
          <span>{property.bedrooms} quartos</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xs text-muted-foreground">a partir de</p>
            <p className="text-lg font-semibold text-foreground">
              {formatBRL(property.nightlyPrice)}
              <span className="text-xs font-normal text-muted-foreground"> /noite</span>
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            Ver detalhes
          </span>
        </div>
      </div>
    </article>
  )
}
