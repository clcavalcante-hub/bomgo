'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { SearchCriteria } from '@/lib/types'
import { defaultCriteria } from '@/lib/services/search-service'

interface AppState {
  // Search
  criteria: SearchCriteria
  setCriteria: (c: SearchCriteria) => void
  isSearchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  // Favorites
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean

  // Sofia
  isSofiaOpen: boolean
  openSofia: () => void
  closeSofia: () => void
  toggleSofia: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [criteria, setCriteria] = useState<SearchCriteria>(defaultCriteria)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isSofiaOpen, setSofiaOpen] = useState(false)

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }, [])

  const value = useMemo<AppState>(
    () => ({
      criteria,
      setCriteria,
      isSearchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      favorites,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      isSofiaOpen,
      openSofia: () => setSofiaOpen(true),
      closeSofia: () => setSofiaOpen(false),
      toggleSofia: () => setSofiaOpen((o) => !o),
    }),
    [criteria, isSearchOpen, favorites, toggleFavorite, isSofiaOpen],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProviders')
  return ctx
}
