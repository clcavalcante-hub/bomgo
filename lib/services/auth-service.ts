"use client"

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession } from "next-auth/react"
import type { AuthSession, User } from "@/lib/types"

/**
 * Client-side auth layer — thin wrapper around NextAuth (real session,
 * httpOnly cookie) that keeps the exact function signatures the rest of the
 * app already calls (signIn/signUp/signOut/getStoredSession), so nothing
 * else needed to change. `getStoredSession` reads a localStorage mirror for
 * synchronous access on mount; the cookie session from NextAuth is always
 * the source of truth and wins on the next real request.
 */

const SESSION_KEY = "bomgo.session"

function persist(session: AuthSession) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore
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

function sessionUserToAppUser(sessionUser: {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  cpf?: string | null
}): User {
  const [firstName, ...rest] = (sessionUser.name ?? "").split(" ")
  return {
    id: sessionUser.id ?? "",
    firstName: firstName || "Hóspede",
    lastName: rest.join(" "),
    email: sessionUser.email ?? "",
    phone: sessionUser.phone ?? null,
    cpf: sessionUser.cpf ?? null,
    avatarUrl: sessionUser.image ?? null,
    isClubMember: false,
    createdAt: new Date().toISOString(),
  }
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  const res = await nextAuthSignIn("credentials", { email, password, redirect: false })
  if (res?.error) throw new Error("E-mail ou senha incorretos.")
  const session = await getSession()
  if (!session?.user) throw new Error("Não foi possível entrar.")
  const authSession: AuthSession = { user: sessionUserToAppUser(session.user), token: "" }
  persist(authSession)
  return authSession
}

export async function signUp(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  cpf?: string
  birthDate?: string
  profession?: string
  phone?: string
  cep?: string
  street?: string
  streetNumber?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
}): Promise<AuthSession> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? "Não foi possível criar a conta.")
  }
  return signIn(input.email, input.password)
}

export async function signInWithGoogle(callbackUrl: string = "/conta"): Promise<void> {
  await nextAuthSignIn("google", { callbackUrl })
}

export async function signInWithFacebook(callbackUrl: string = "/conta"): Promise<void> {
  await nextAuthSignIn("facebook", { callbackUrl })
}

export function signOut() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
  }
  void nextAuthSignOut({ redirect: false })
}
