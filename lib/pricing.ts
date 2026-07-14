import type {
  Property,
  PriceBreakdown,
  InstallmentOption,
} from '@/lib/types'
import { parseLocalDate } from '@/lib/dates'

export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBRL(value: number): string {
  return BRL.format(value)
}

export function nightsBetween(
  checkIn: string | null,
  checkOut: string | null,
): number {
  if (!checkIn || !checkOut) return 0
  // Always parse "yyyy-MM-dd" as local calendar dates — never `new Date(iso)`
  // (UTC parse), which rolls back a day in any timezone behind UTC. See lib/dates.ts.
  const start = parseLocalDate(checkIn)
  const end = parseLocalDate(checkOut)
  const diff = end.getTime() - start.getTime()
  const nights = Math.round(diff / (1000 * 60 * 60 * 24))
  return nights > 0 ? nights : 0
}

// Simulated price breakdown. When Cielo/Stays are connected the totals come
// from the reservation quote endpoint instead of this helper.
export function computePrice(
  property: Property,
  nights: number,
): PriceBreakdown {
  const effectiveNights = nights > 0 ? nights : 1
  const subtotal = property.nightlyPrice * effectiveNights
  const serviceFee = Math.round(subtotal * 0.08)
  const total =
    subtotal + property.cleaningFee + property.energyFee + serviceFee
  return {
    nights: effectiveNights,
    nightlyPrice: property.nightlyPrice,
    subtotal,
    cleaningFee: property.cleaningFee,
    energyFee: property.energyFee,
    serviceFee,
    total,
  }
}

// Installment simulation. Up to 3x without interest; 4x–12x with a simulated
// monthly interest rate. Real values will come from the Cielo API.
const MONTHLY_INTEREST = 0.0199

export function buildInstallments(total: number): InstallmentOption[] {
  const options: InstallmentOption[] = []
  for (let n = 1; n <= 12; n++) {
    if (n <= 3) {
      options.push({
        installments: n,
        amount: Math.round((total / n) * 100) / 100,
        total,
        hasInterest: false,
      })
    } else {
      const factor =
        (MONTHLY_INTEREST * Math.pow(1 + MONTHLY_INTEREST, n)) /
        (Math.pow(1 + MONTHLY_INTEREST, n) - 1)
      const amount = total * factor
      options.push({
        installments: n,
        amount: Math.round(amount * 100) / 100,
        total: Math.round(amount * n * 100) / 100,
        hasInterest: true,
      })
    }
  }
  return options
}
