import "server-only"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

export interface DbUser {
  id: string
  email: string
  password_hash: string | null
  first_name: string
  last_name: string
  cpf: string | null
  birth_date: string | null
  profession: string | null
  phone: string | null
  cep: string | null
  street: string | null
  street_number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  google_id: string | null
  is_club_member: boolean
  created_at: string
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await query<DbUser>("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()])
  return rows[0] ?? null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const rows = await query<DbUser>("SELECT * FROM users WHERE id = $1", [id])
  return rows[0] ?? null
}

export async function verifyPassword(email: string, password: string): Promise<DbUser | null> {
  const user = await findUserByEmail(email)
  if (!user?.password_hash) return null
  const ok = await bcrypt.compare(password, user.password_hash)
  return ok ? user : null
}

export interface CreateUserInput {
  email: string
  password?: string // omitted for social-login-only accounts
  firstName: string
  lastName: string
  cpf?: string
  birthDate?: string // YYYY-MM-DD
  profession?: string
  phone?: string
  cep?: string
  street?: string
  streetNumber?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  googleId?: string
}

export async function createUser(input: CreateUserInput): Promise<DbUser> {
  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null
  const rows = await query<DbUser>(
    `INSERT INTO users (
      email, password_hash, first_name, last_name, cpf, birth_date, profession,
      phone, cep, street, street_number, complement, neighborhood, city, state, google_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *`,
    [
      input.email.toLowerCase().trim(),
      passwordHash,
      input.firstName,
      input.lastName,
      input.cpf ?? null,
      input.birthDate ?? null,
      input.profession ?? null,
      input.phone ?? null,
      input.cep ?? null,
      input.street ?? null,
      input.streetNumber ?? null,
      input.complement ?? null,
      input.neighborhood ?? null,
      input.city ?? null,
      input.state ?? null,
      input.googleId ?? null,
    ],
  )
  return rows[0]
}

export async function findOrCreateGoogleUser(input: {
  googleId: string
  email: string
  firstName: string
  lastName: string
}): Promise<DbUser> {
  const byGoogleId = await query<DbUser>("SELECT * FROM users WHERE google_id = $1", [input.googleId])
  if (byGoogleId[0]) return byGoogleId[0]

  // Same email already registered via password — link the Google id to it
  // instead of creating a duplicate account.
  const byEmail = await findUserByEmail(input.email)
  if (byEmail) {
    const rows = await query<DbUser>("UPDATE users SET google_id = $1, updated_at = now() WHERE id = $2 RETURNING *", [
      input.googleId,
      byEmail.id,
    ])
    return rows[0]
  }

  return createUser({
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName || "",
    googleId: input.googleId,
  })
}
