import type {
  PaymentMethod,
  PaymentStatus,
  PriceBreakdown,
} from '@/lib/types'

// -------------------------------------------------------------------------
// Payment service (MOCK — Cielo contract)
//
// The real implementation will call the Cielo API from a secure backend
// route (never the frontend). Card data must never touch our servers in
// plain text — tokenization happens client-side with the Cielo SDK.
// These mocks only simulate the resulting states so the checkout UI can be
// fully exercised: processing -> approved | declined | pix-pending.
// -------------------------------------------------------------------------

export interface CardPaymentInput {
  method: 'card'
  amount: number
  installments: number
  cardNumber: string
  holder: string
  expiry: string
  cvv: string
}

export interface PixPaymentInput {
  method: 'pix'
  amount: number
}

export type PaymentInput = CardPaymentInput | PixPaymentInput

export interface PaymentResult {
  status: PaymentStatus
  transactionId: string
  pix?: {
    qrCodeText: string
    expiresInSeconds: number
  }
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

// A simulated Pix "copia e cola" string (not a real EMV payload).
function fakePixPayload(amount: number): string {
  const value = amount.toFixed(2)
  return `00020126BR.GOV.BCB.PIX01BOMGO${generateId('PIX')}5204000053039865406${value}5802BR5910BOMGO PAY6009FORTALEZA62070503***6304AB12`
}

export async function processPayment(
  input: PaymentInput,
): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 1800))

  if (input.method === 'pix') {
    return {
      status: 'pix-pending',
      transactionId: generateId('TX'),
      pix: {
        qrCodeText: fakePixPayload(input.amount),
        expiresInSeconds: 15 * 60,
      },
    }
  }

  // Card: simulate decline for a known test number, approve otherwise.
  const digits = input.cardNumber.replace(/\s/g, '')
  const declined = digits.endsWith('0000') || digits.startsWith('4000')

  return {
    status: declined ? 'declined' : 'approved',
    transactionId: generateId('TX'),
  }
}

// Simulate the Pix confirmation webhook (Cielo -> Bomgo).
export async function confirmPix(transactionId: string): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 1200))
  return { status: 'approved', transactionId }
}

export function generateVoucherCode(): string {
  return `BMG-${generateId('').replace('-', '')}`.slice(0, 12)
}

export interface QuoteRequest {
  propertyId: string
  method: PaymentMethod
  price: PriceBreakdown
}
