import "server-only"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { verifyPassword, findOrCreateGoogleUser, findOrCreateFacebookUser, findUserById } from "@/lib/auth/users"
import { findSingleOtaReservation } from "@/lib/reservations/ota-lookup"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
        const password = String(credentials?.password ?? "")
        if (!email || !password) return null
        const user = await verifyPassword(email, password)
        if (!user) return null
        return { id: user.id, email: user.email, name: `${user.first_name} ${user.last_name}`.trim() }
      },
    }),
    // Login for guests who booked via an OTA (Booking.com, Airbnb, Expedia)
    // — their e-mail on file is a masked relay that never matches a real
    // Bomgo account, so email/senha can't work for them. Proves identity
    // with the same "name + reservation code (or check-in date)" check
    // already used by the public /minha-reserva lookup, then issues a real
    // session instead of leaving the guest on a bare URL-params page.
    Credentials({
      id: "reserva",
      name: "Código da reserva",
      credentials: {
        nome: { label: "Nome completo", type: "text" },
        codigo: { label: "Código da reserva", type: "text" },
        checkin: { label: "Data de check-in", type: "date" },
      },
      async authorize(credentials) {
        const nome = String(credentials?.nome ?? "")
        const codigo = String(credentials?.codigo ?? "")
        const checkin = String(credentials?.checkin ?? "")
        const { reservation } = await findSingleOtaReservation({ name: nome, code: codigo, checkin })
        if (!reservation) return null
        return {
          id: `ota:${reservation.connectionId}:${reservation.staysReservationId}`,
          name: nome.trim(),
          email: null,
          // Extra fields (not part of NextAuth's base User type) — flow
          // through to the jwt callback's `user` param on first sign-in so
          // /minha-reserva can re-identify the same reservation from the
          // session alone, without needing the code/name back in the URL.
          otaCodigo: reservation.reservationCode ?? reservation.partnerCode ?? "",
          otaCheckin: reservation.checkInDate?.slice(0, 10) ?? "",
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const [firstName, ...rest] = (profile?.name ?? user.name ?? "").split(" ")
        const dbUser = await findOrCreateGoogleUser({
          googleId: account.providerAccountId,
          email: user.email ?? "",
          firstName: firstName || "Hóspede",
          lastName: rest.join(" "),
          avatarUrl: user.image ?? undefined,
        })
        user.id = dbUser.id
      }
      if (account?.provider === "facebook") {
        const [firstName, ...rest] = (profile?.name ?? user.name ?? "").split(" ")
        const dbUser = await findOrCreateFacebookUser({
          facebookId: account.providerAccountId,
          email: user.email ?? "",
          firstName: firstName || "Hóspede",
          lastName: rest.join(" "),
          avatarUrl: user.image ?? undefined,
        })
        user.id = dbUser.id
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id
        const otaUser = user as { otaCodigo?: string; otaCheckin?: string }
        if (otaUser.otaCodigo !== undefined) token.otaCodigo = otaUser.otaCodigo
        if (otaUser.otaCheckin !== undefined) token.otaCheckin = otaUser.otaCheckin
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        ;(session.user as { id?: string }).id = token.userId as string
        const isOtaGuest = (token.userId as string).startsWith("ota:")
        ;(session.user as { isOtaGuest?: boolean }).isOtaGuest = isOtaGuest
        if (isOtaGuest) {
          ;(session.user as { otaCodigo?: string; otaCheckin?: string }).otaCodigo = (token.otaCodigo as string) ?? ""
          ;(session.user as { otaCodigo?: string; otaCheckin?: string }).otaCheckin =
            (token.otaCheckin as string) ?? ""
        } else {
          const dbUser = await findUserById(token.userId as string)
          if (dbUser) {
            session.user.name = `${dbUser.first_name} ${dbUser.last_name}`.trim()
            session.user.email = dbUser.email
            session.user.image = dbUser.avatar_url ?? null
            ;(session.user as { phone?: string | null; cpf?: string | null }).phone = dbUser.phone
            ;(session.user as { phone?: string | null; cpf?: string | null }).cpf = dbUser.cpf
          }
        }
      }
      return session
    },
  },
})
