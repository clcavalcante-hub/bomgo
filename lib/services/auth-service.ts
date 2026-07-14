import type { AuthSession, User } from "@/lib/types"

/**
 * Preview auth layer.
 *
 * This mock keeps a session in localStorage so the account flows work end to
 * end without a backend. Every function is async and returns the same shape a
 * real provider (Better Auth on Neon, Supabase Auth) would return, so wiring
 * the real backend later is a drop-in replacement — the UI never changes.
 */

const SESSION_KEY = "bomgo.session"

function makeUser(firstName: string, lastName: string, email: string): User {
  return {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    firstName,
    lastName,
    email,
    isClubMember: false,
    createdAt: new Date().toISOString(),
  }
}

function persist(session: AuthSession) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage can be unavailable (private mode); fail silently.
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export async function signIn(email: string, _password: string): Promise<AuthSession> {
  // Simulated latency so the UI feedback matches a real network round-trip.
  await new Promise((r) => setTimeout(r, 650))
  const name = email.split("@")[0] ?? "Viajante"
  const firstName = name.charAt(0).toUpperCase() + name.slice(1)
  const session: AuthSession = {
    user: { ...makeUser(firstName, "", email), isClubMember: true },
    token: `tok_${Math.random().toString(36).slice(2)}`,
  }
  persist(session)
  return session
}

export async function signUp(input: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<AuthSession> {
  await new Promise((r) => setTimeout(r, 750))
  const session: AuthSession = {
    user: makeUser(input.firstName, input.lastName, input.email),
    token: `tok_${Math.random().toString(36).slice(2)}`,
  }
  persist(session)
  return session
}

export function signOut() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
