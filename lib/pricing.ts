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

// Local estimate only — shown before the guest picks dates / before Stays
// confirms the real quote for those exact dates. Never adds a fabricated
// service fee: `serviceFee` stays 0 unless Bomgo defines a real, disclosed
// one. Once real dates are set, callers must use the live `/api/stays/price`
// quote instead of this estimate.
export function computePrice(
  property: Property,
  nights: number,
): PriceBreakdown {
  const effectiveNights = nights > 0 ? nights : 1
  const subtotal = property.nightlyPrice * effectiveNights
  const total = subtotal + property.cleaningFee + property.energyFee
  return {
    nights: effectiveNights,
    nightlyPrice: property.nightlyPrice,
    subtotal,
    cleaningFee: property.cleaningFee,
    energyFee: property.energyFee,
    serviceFee: 0,
    total,
  }
}

// Installment simulation.
// 1x-3x: sem juros para o hóspede (Bomgo absorve o custo Cielo/banco).
// 4x-6x: markup fixo cobrindo o custo real confirmado — taxa Cielo
// "Crédito Parc. Loja" (4,48%, conferida em venda real) + taxa do banco
// para antecipação de recebíveis (2,41%, conferida em venda real de 3x:
// R$4.541,80 bruto -> R$4.338,34 após Cielo -> R$4.233,64 após banco).
// Total: 6,89% fixo, não composto por parcela (a taxa Cielo já é fixa de
// 2x a 6x nessa faixa, não escalona por mês).
// Sem parcelas acima de 6x — não cobrado/confirmado para essa faixa.
const INSTALLMENT_MARKUP = 0.0689

export function buildInstallments(total: number): InstallmentOption[] {
  const options: InstallmentOption[] = []
  for (let n = 1; n <= 6; n++) {
    if (n <= 3) {
      options.push({
        installments: n,
        amount: Math.round((total / n) * 100) / 100,
        total,
        hasInterest: false,
      })
    } else {
      const grandTotal = Math.round(total * (1 + INSTALLMENT_MARKUP) * 100) / 100
      options.push({
        installments: n,
        amount: Math.round((grandTotal / n) * 100) / 100,
        total: grandTotal,
        hasInterest: true,
      })
    }
  }
  return options
}
