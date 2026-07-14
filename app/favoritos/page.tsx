'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Search } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { PropertyCard } from '@/components/property/property-card'
import type { Property } from '@/lib/types'

export default function FavoritosPage() {
  const { favorites, openSearch } = useApp()
  const [saved, setSaved] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorites.length === 0) {
      setSaved([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    Promise.all(
      favorites.map(async (id) => {
        try {
          const res = await fetch(`/api/stays/listing/${encodeURIComponent(id)}`, { cache: 'no-store' })
          if (!res.ok) return null
          const body = await res.json().catch(() => null)
          return (body?.property as Property | undefined) ?? null
        } catch {
          return null
        }
      }),
    ).then((results) => {
      if (!active) return
      setSaved(results.filter((p): p is Property => Boolean(p)))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [favorites])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
      <header className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <Heart className="size-4 fill-cta text-cta" /> Meus favoritos
        </p>
        <h1 className="text-balance font-serif text-3xl font-medium text-foreground md:text-4xl">
          Estadias que você salvou
        </h1>
        <p className="max-w-xl text-pretty text-muted-foreground">
          {saved.length > 0
            ? 'Compare, decida com calma e reserve quando estiver pronto. A Sofia pode ajudar a escolher.'
            : 'Toque no coração de qualquer hospedagem para guardá-la aqui.'}
        </p>
      </header>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: favorites.length || 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-3xl bg-muted" />
              <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : saved.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-background">
            <Heart className="size-7 text-muted-foreground" />
          </span>
          <p className="mt-4 font-medium text-foreground">
            {favorites.length > 0 ? 'Não foi possível carregar seus favoritos agora' : 'Nenhum favorito ainda'}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {favorites.length > 0
              ? 'Algumas hospedagens salvas podem não estar mais disponíveis. Tente novamente em instantes.'
              : 'Explore as hospedagens e salve as que mais gostar para encontrá-las rapidamente depois.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/busca"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Explorar hospedagens
            </Link>
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary"
            >
              <Search className="size-4" /> Nova busca
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
