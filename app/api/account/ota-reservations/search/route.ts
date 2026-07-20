import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { findOtaReservations } from "@/lib/reservations/ota-lookup"
import { query } from "@/lib/db"

interface SearchBody {
  code?: string
  fullName?: string
}

export async function POST(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: SearchBody
  try {
    body = (await request.json()) as SearchBody
  } catch {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 })
  }

  const code = body.code?.trim()
  const fullName = body.fullName?.trim()
  if (!fullName) {
    return NextResponse.json(
      { error: "Informe o nome completo do titular da reserva (o código sozinho não é suficiente pra buscar)." },
      { status: 400 },
    )
  }

  let matches = await findOtaReservations({ name: fullName })
  if (code) {
    matches = matches.filter(
      (r) => r.reservationCode?.toUpperCase() === code.toUpperCase() || r.partnerCode?.toUpperCase() === code.toUpperCase(),
    )
  }

  if (matches.length === 0) {
    return NextResponse.json(
      { error: "Não encontramos nenhuma reserva com esses dados. Confira o código ou o nome e tente de novo." },
      { status: 404 },
    )
  }

  // Persist a snapshot so future dashboard loads don't need to re-search —
  // upsert per (user, reservation) pair.
  await Promise.all(
    matches.map((m) =>
      query(
        `INSERT INTO ota_reservation_links (user_id, stays_reservation_id, connection_id, snapshot, created_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (user_id, stays_reservation_id) DO UPDATE SET snapshot = $4`,
        [userId, m.staysReservationId, m.connectionId, JSON.stringify(m)],
      ),
    ),
  )

  return NextResponse.json({ reservations: matches })
}

export const dynamic = "force-dynamic"
