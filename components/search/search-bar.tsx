'use client'

import { Search } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { cn } from '@/lib/utils'

export function SearchBar({
  className,
  placeholder = 'Para onde você quer viajar?',
}: {
  className?: string
  placeholder?: string
}) {
  const { openSearch } = useApp()

  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        'group flex w-full items-center gap-3 rounded-full bg-background/95 py-3 pl-5 pr-3 text-left shadow-xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur transition-all hover:shadow-2xl',
        className,
      )}
    >
      <Search className="size-5 shrink-0 text-primary" />
      <span className="flex-1 truncate text-sm text-muted-foreground md:text-base">
        {placeholder}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-sm font-semibold text-cta-foreground transition-transform group-hover:scale-[1.02] group-active:scale-[0.98] md:px-5">
        <Search className="size-4 md:hidden" />
        <span className="hidden md:inline">Buscar</span>
        <span className="md:hidden">Ir</span>
      </span>
    </button>
  )
}
