import { NextResponse } from "next/server"
import { findUserByEmail, createUser } from "@/lib/auth/users"

interface SignupBody {
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
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i)
  let check1 = (sum * 10) % 11
  if (check1 === 10) check1 = 0
  if (check1 !== Number(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i)
  let check2 = (sum * 10) % 11
  if (check2 === 10) check2 = 0
  return check2 === Number(digits[10])
}

export async function POST(request: Request) {
  let body: SignupBody
  try {
    body = (await request.json()) as SignupBody
  } catch {
    return NextResponse.json({ error: "invalid-request", message: "Corpo inválido." }, { status: 400 })
  }

  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return NextResponse.json({ error: "invalid-request", message: "Informe nome e sobrenome." }, { status: 400 })
  }
  if (!isValidEmail(body.email ?? "")) {
    return NextResponse.json({ error: "invalid-request", message: "E-mail inválido." }, { status: 400 })
  }
  if (!body.password || body.password.length < 6) {
    return NextResponse.json(
      { error: "invalid-request", message: "A senha deve ter ao menos 6 caracteres." },
      { status: 400 },
    )
  }
  if (body.cpf && !isValidCPF(body.cpf)) {
    return NextResponse.json({ error: "invalid-request", message: "CPF inválido." }, { status: 400 })
  }

  const existing = await findUserByEmail(body.email)
  if (existing) {
    return NextResponse.json({ error: "email-taken", message: "Este e-mail já tem uma conta." }, { status: 409 })
  }

  const user = await createUser({
    email: body.email,
    password: body.password,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    cpf: body.cpf?.replace(/\D/g, ""),
    birthDate: body.birthDate,
    profession: body.profession,
    phone: body.phone,
    cep: body.cep?.replace(/\D/g, ""),
    street: body.street,
    streetNumber: body.streetNumber,
    complement: body.complement,
    neighborhood: body.neighborhood,
    city: body.city,
    state: body.state,
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}

export const dynamic = "force-dynamic"
