import "server-only"

import { createHash } from "node:crypto"
import { query } from "@/lib/db"
import type { PaymentStatus } from "@/lib/types"

export interface ChangePaymentRecord {
  protocol: string
  token_hash: string
  amount_brl: number
  status: string
  payment_id: string | null
  pix_qr_code: string | null
  pix_qr_base64: string | null
  created_at: string
  updated_at: string
}

let schemaReady: Promise<void> | null = null

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = query(`CREATE TABLE IF NOT EXISTS sofia_change_payments (
      protocol uuid PRIMARY KEY,
      token_hash text NOT NULL,
      amount_brl numeric(12,2) NOT NULL CHECK (amount_brl > 0),
      status text NOT NULL,
      payment_id text UNIQUE,
      pix_qr_code text,
      pix_qr_base64 text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`).then(() => undefined)
  }
  return schemaReady
}

export function hashChangeToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function getChangePayment(protocol: string): Promise<ChangePaymentRecord | null> {
  await ensureSchema()
  const rows = await query<ChangePaymentRecord>("SELECT * FROM sofia_change_payments WHERE protocol=$1::uuid", [protocol])
  return rows[0] ?? null
}

export async function claimChangePayment(protocol: string, token: string, amount: number): Promise<"claimed" | "existing"> {
  await ensureSchema()
  const rows = await query<{ protocol: string }>(
    `INSERT INTO sofia_change_payments(protocol,token_hash,amount_brl,status)
     VALUES($1::uuid,$2,$3::numeric,'creating')
     ON CONFLICT(protocol) DO NOTHING RETURNING protocol::text`,
    [protocol, hashChangeToken(token), amount],
  )
  return rows[0] ? "claimed" : "existing"
}

export async function retryChangePayment(protocol: string, token: string, amount: number): Promise<boolean> {
  await ensureSchema()
  const rows = await query<{ protocol: string }>(
    `UPDATE sofia_change_payments SET token_hash=$2,amount_brl=$3::numeric,status='creating',payment_id=NULL,pix_qr_code=NULL,pix_qr_base64=NULL,updated_at=now()
     WHERE protocol=$1::uuid AND status IN ('failed','declined') RETURNING protocol::text`,
    [protocol, hashChangeToken(token), amount],
  )
  return Boolean(rows[0])
}

export async function saveCreatedChangePix(protocol: string, paymentId: string, qrCode: string, qrBase64?: string) {
  await ensureSchema()
  await query(
    `UPDATE sofia_change_payments SET status='pix-pending',payment_id=$2,pix_qr_code=$3,pix_qr_base64=$4,updated_at=now() WHERE protocol=$1::uuid AND status='creating'`,
    [protocol, paymentId, qrCode, qrBase64 ?? null],
  )
}

export async function failChangePayment(protocol: string) {
  await ensureSchema()
  await query("UPDATE sofia_change_payments SET status='failed',updated_at=now() WHERE protocol=$1::uuid AND status='creating'", [protocol])
}

export async function updateChangePaymentStatus(protocol: string, status: PaymentStatus) {
  await ensureSchema()
  await query("UPDATE sofia_change_payments SET status=$2,updated_at=now() WHERE protocol=$1::uuid", [protocol, status])
}

export function tokenMatchesPayment(record: ChangePaymentRecord, token: string) {
  return record.token_hash === hashChangeToken(token)
}
