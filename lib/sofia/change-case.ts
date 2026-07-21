import "server-only"

export interface ChangeCaseView {
  protocol: string
  status: string
  status_label: string
  reservation_code: string
  change_type: string
  current_checkin: string
  current_checkout: string
  requested_checkin?: string | null
  requested_checkout: string
  extra_nights: number
  available: boolean
  estimated_additional_brl: number | null
  approved_amount_brl: number | null
  currency: string
  requires_human_review: boolean
  expires_at: string
  updated_at: string
}

const LOOKUP_URL =
  process.env.SOFIA_CHANGE_CASE_LOOKUP_URL ||
  "https://n8n.bomgobrasil.com/webhook/sofia3-change-case-public-v1"

export async function getChangeCase(token: string): Promise<ChangeCaseView | null> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null
  try {
    const response = await fetch(LOOKUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { ok?: boolean; found?: boolean; case?: ChangeCaseView }
    return payload.ok === true && payload.found === true && payload.case ? payload.case : null
  } catch {
    return null
  }
}
