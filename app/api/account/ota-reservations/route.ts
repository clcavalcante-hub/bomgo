import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { findUserById } from "@/lib/auth/users"
import { findOtaReservations, type OtaReservationView } from "@/lib/reservations/ota-lookup"
import { query } from "@/lib/db"

export async function GET() {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  if (userId.startsWith("ota:")) {
    return NextResponse.json({ reservations: [] })
  }

  const user = await findUserById(userId)
  if (!user) {
    return NextResponse.json({ reservations: [] })
  }

  // Auto-match by the account's own email/phone, plus anything the guest
  // manually linked before via /api/account/ota-reservations/search (cached
  // snapshot from link time — no need to re-hit Stays every page load).
  const [byContact, linkedRows] = await Promise.all([
    findOtaReservations({ email: user.email, phone: user.phone ?? undefined }),
    query<{ stays_reservation_id: string; snapshot: OtaReservationView }>(
      "SELECT stays_reservation_id, snapshot FROM ota_reservation_links WHERE user_id = $1",
      [userId],
    ),
  ])

  const byId = new Map<string, OtaReservationView>()
  for (const row of linkedRows) byId.set(row.stays_reservation_id, row.snapshot)
  for (const r of byContact) byId.set(r.staysReservationId, r) // live data wins over a stale snapshot

  return NextResponse.json({ reservations: [...byId.values()] })
}

export const dynamic = "force-dynamic"
