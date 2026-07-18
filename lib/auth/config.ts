import "server-only"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { verifyPassword, findOrCreateGoogleUser, findOrCreateFacebookUser, findUserById } from "@/lib/auth/users"

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        })
        user.id = dbUser.id
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id
      return token
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        ;(session.user as { id?: string }).id = token.userId as string
        const dbUser = await findUserById(token.userId as string)
        if (dbUser) {
          session.user.name = `${dbUser.first_name} ${dbUser.last_name}`.trim()
          session.user.email = dbUser.email
        }
      }
      return session
    },
  },
})
