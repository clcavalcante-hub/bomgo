'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import type { AuthSession, SearchCriteria, User } from '@/lib/types'
import { defaultCriteria } from '@/lib/services/search-service'
import { getStoredSession, signOut } from '@/lib/services/auth-service'
import { SessionProvider } from 'next-auth/react'

const FAVORITES_KEY = 'bomgo.favorites'

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

  // Auth
  user: User | null
  login: (session: AuthSession) => void
  logout: () => void

  // Sofia
  isSofiaOpen: boolean
  openSofia: () => void
  closeSofia: () => void
  toggleSofia: () => void

  // Auth modal (compact login/signup prompt, e.g. before checkout)
  isAuthModalOpen: boolean
  authModalRedirect: string | null
  openAuthModal: (redirectTo?: string) => void
  closeAuthModal: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [criteria, setCriteria] = useState<SearchCriteria>(defaultCriteria)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isSofiaOpen, setSofiaOpen] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [authModalRedirect, setAuthModalRedirect] = useState<string | null>(null)

  // Hydrate persisted favorites + session on mount (client preferences,
  // swappable for a real backend later).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY)
      if (raw) setFavorites(JSON.parse(raw) as string[])
    } catch {
      // ignore
    }
    const session = getStoredSession()
    if (session) setUser(session.user)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch {
      // ignore
    }
  }, [favorites])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }, [])

  const login = useCallback(
    (session: AuthSession) => {
      setUser(session.user)
      if (isAuthModalOpen) {
        const redirect = authModalRedirect
        setAuthModalOpen(false)
        setAuthModalRedirect(null)
        if (redirect) router.push(redirect)
      }
    },
    [isAuthModalOpen, authModalRedirect, router],
  )

  const logout = useCallback(() => {
    signOut()
    setUser(null)
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
      user,
      login,
      logout,
      isSofiaOpen,
      openSofia: () => setSofiaOpen(true),
      closeSofia: () => setSofiaOpen(false),
      toggleSofia: () => setSofiaOpen((o) => !o),
      isAuthModalOpen,
      authModalRedirect,
      openAuthModal: (redirectTo?: string) => {
        setAuthModalRedirect(redirectTo ?? null)
        setAuthModalOpen(true)
      },
      closeAuthModal: () => {
        setAuthModalOpen(false)
        setAuthModalRedirect(null)
      },
    }),
    [
      criteria,
      isSearchOpen,
      favorites,
      toggleFavorite,
      user,
      login,
      logout,
      isSofiaOpen,
      isAuthModalOpen,
      authModalRedirect,
    ],
  )

  return (
    <SessionProvider>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </SessionProvider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProviders')
  return ctx
}
