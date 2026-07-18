import "server-only"

import type { StaysConnection } from "@/lib/integrations/stays-connection-registry"
import type { ReservationCustomer } from "@/lib/types"
import { staysWrite } from "@/lib/reservations/stays-write-client"

/**
 * StaysClientAdapter — client (guest) endpoints for ONE Stays connection.
 *
 * Wraps the documented Booking API client endpoints:
 *   - POST /external/v1/booking/clients        (create client)
 *   - GET  /external/v1/booking/clients        (list/find by email)
 *   - GET  /external/v1/booking/clients/{id}   (retrieve client)
 *
 * Every call is scoped to the connection's credentials and guarded by the
 * shared timeout + controlled retry policy. It never runs on the client.
 */
export class StaysClientAdapter {
  constructor(private readonly connection: StaysConnection) {}

  /** Look up an existing client by email in the owning account. */
  async findByEmail(email: string): Promise<{ id: string } | null> {
    const res = await staysWrite<any>(this.connection, {
      method: "GET",
      path: `/external/v1/booking/clients?email=${encodeURIComponent(email)}`,
    })
    if (!res.ok || !res.data) return null
    const list: any[] = Array.isArray(res.data) ? res.data : (res.data.clients ?? [])
    const match = list.find((c) => (c?.email ?? "").toLowerCase() === email.toLowerCase()) ?? list[0]
    const id = match?._id ?? match?.id
    return id ? { id: String(id) } : null
  }

  /** Search clients by partial email, phone, or full name — used to link a
   * guest's Bomgo account to reservations they made directly on an OTA
   * (Booking.com/Airbnb/Expedia), where the OTA-relay email on file with
   * Stays rarely matches the guest's real Google/Facebook login email. */
  async search(query: { email?: string; phone?: string; name?: string }): Promise<{ id: string }[]> {
    const params = new URLSearchParams()
    if (query.email) params.set("email", query.email)
    if (query.phone) params.set("phone", query.phone)
    if (query.name) params.set("name", query.name)
    if ([...params.keys()].length === 0) return []
    const res = await staysWrite<any>(this.connection, {
      method: "GET",
      path: `/external/v1/booking/clients?${params.toString()}`,
    })
    if (!res.ok || !res.data) return []
    const list: any[] = Array.isArray(res.data) ? res.data : (res.data.clients ?? [])
    return list.map((c) => ({ id: String(c._id ?? c.id) })).filter((c) => c.id)
  }

  /** Create a new client (guest) in the owning account. */
  async create(customer: ReservationCustomer): Promise<{ id: string } | null> {
    const body: Record<string, unknown> = {
      kind: "person",
      fName: customer.firstName,
      lName: customer.lastName,
      email: customer.email,
      isUser: false,
    }
    if (customer.document) {
      const digits = customer.document.replace(/\D/g, "")
      if (digits) body.documents = [{ type: "cpf", numb: digits }]
    }
    // NOTE: phone intentionally omitted here — the previous payload sent the
    // raw phone number into a field named `iso` (which Stays' client schema
    // almost certainly expects to be a country code, not the number itself)
    // and every reservation was failing client creation with a 400 because
    // of it. Not worth guessing the right shape blind; re-add once the
    // correct Stays client phone schema is confirmed against their docs.

    const res = await staysWrite<any>(this.connection, {
      method: "POST",
      path: "/external/v1/booking/clients",
      body,
    })
    if (!res.ok || !res.data) return null
    const id = res.data._id ?? res.data.id
    return id ? { id: String(id) } : null
  }

  /**
   * Find-or-create: reuse an existing client when the email already exists in
   * the account, otherwise create one. Guarantees a client id in the CORRECT
   * account before a reservation is created.
   */
  async findOrCreate(customer: ReservationCustomer): Promise<{ id: string; created: boolean } | null> {
    const existing = await this.findByEmail(customer.email)
    if (existing) return { id: existing.id, created: false }
    const created = await this.create(customer)
    return created ? { id: created.id, created: true } : null
  }
}
