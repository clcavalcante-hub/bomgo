"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5",
        className,
      )}
    >
      <Link href={`/imovel/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden">
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
      </Link>

      <button
        type="button"
        onClick={() => toggleFavorite(property.id)}
        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        aria-pressed={favorite}
        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:scale-105"
      >
        <Heart className={cn("size-5", favorite ? "fill-cta text-cta" : "text-foreground")} />
      </button>

      <div className="flex flex-1 flex-col p-4">
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

        <Link href={`/imovel/${property.slug}`} className="mt-1.5">
          <h3 className="line-clamp-1 font-serif text-lg font-medium text-foreground transition-colors group-hover:text-primary">
            {property.name}
          </h3>
        </Link>

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
