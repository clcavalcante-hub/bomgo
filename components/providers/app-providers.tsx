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
import { SessionProvider, useSession } from 'next-auth/react'
import type { AuthSession, SearchCriteria, User } from '@/lib/types'
import { defaultCriteria } from '@/lib/services/search-service'
import { signOut as authSignOut } from '@/lib/services/auth-service'

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
  authLoading: boolean
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

function sessionUserToAppUser(sessionUser: {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  cpf?: string | null
}): User {
  const [firstName, ...rest] = (sessionUser.name ?? '').split(' ')
  return {
    id: sessionUser.id ?? '',
    firstName: firstName || 'Hóspede',
    lastName: rest.join(' '),
    email: sessionUser.email ?? '',
    phone: sessionUser.phone ?? null,
    cpf: sessionUser.cpf ?? null,
    avatarUrl: sessionUser.image ?? null,
    isClubMember: false,
    createdAt: new Date().toISOString(),
  }
}

// Rendered INSIDE <SessionProvider> so useSession() actually has a provider
// above it in the tree — NextAuth's real cookie session is the single
// source of truth for `user` now, for every login path (credentials,
// Google, Facebook). There used to be a second, parallel localStorage-only
// session that only credentials login ever populated, so Google/Facebook
// logins succeeded server-side but the rest of the app never saw `user`
// and bounced the guest straight back to /login.
function AppProvidersInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: nextAuthSession, status } = useSession()
  const [criteria, setCriteria] = useState<SearchCriteria>(defaultCriteria)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isSofiaOpen, setSofiaOpen] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [authModalRedirect, setAuthModalRedirect] = useState<string | null>(null)

  const user: User | null = useMemo(() => {
    if (status !== 'authenticated' || !nextAuthSession?.user) return null
    return sessionUserToAppUser(
      nextAuthSession.user as {
        id?: string
        name?: string | null
        email?: string | null
        image?: string | null
        phone?: string | null
        cpf?: string | null
      },
    )
  }, [status, nextAuthSession])

  // Hydrate persisted favorites on mount (client preference, swappable for a
  // real backend later).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY)
      if (raw) setFavorites(JSON.parse(raw) as string[])
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch {
      // ignore
    }
  }, [favorites])

  // Once the real session becomes authenticated while the compact auth
  // modal is open (credentials login resolves synchronously, but this also
  // covers the OAuth redirect finishing), close it and continue to
  // wherever the guest was headed.
  useEffect(() => {
    if (status === 'authenticated' && isAuthModalOpen) {
      const redirect = authModalRedirect
      setAuthModalOpen(false)
      setAuthModalRedirect(null)
      if (redirect) router.push(redirect)
    }
  }, [status, isAuthModalOpen, authModalRedirect, router])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }, [])

  // Kept for the credentials login/signup flow, which still calls
  // login(session) right after establishing the NextAuth session — the
  // useSession() hook above will pick up the real session on its own, this
  // just closes the modal / redirects immediately instead of waiting for
  // the next poll.
  const login = useCallback(
    (_session: AuthSession) => {
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
    authSignOut()
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
      authLoading: status === 'loading',
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
      status,
      login,
      logout,
      isSofiaOpen,
      isAuthModalOpen,
      authModalRedirect,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvidersInner>{children}</AppProvidersInner>
    </SessionProvider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProviders')
  return ctx
}
