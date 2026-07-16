"use client"

import { Heart } from "lucide-react"
import { ShareButton } from "@/components/property/share-button"
import { useApp } from "@/components/providers/app-providers"
import { cn } from "@/lib/utils"

export function PropertyActions({
  propertyId,
  propertyName,
  slug,
}: {
  propertyId: string
  propertyName: string
  slug: string
}) {
  const { isFavorite, toggleFavorite } = useApp()
  const favorite = isFavorite(propertyId)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggleFavorite(propertyId)}
        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        aria-pressed={favorite}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:border-primary"
      >
        <Heart className={cn("size-4", favorite ? "fill-cta text-cta" : "text-foreground")} />
        Salvar
      </button>
      <ShareButton
        title={propertyName}
        url={`/imovel/${slug}`}
        label="Compartilhar"
        className="h-9 w-auto gap-1.5 rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground shadow-none transition hover:border-primary"
      />
    </div>
  )
}
