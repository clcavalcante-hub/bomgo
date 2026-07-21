/**
 * Fallback "vagas extras" parking note for the welcome guide's Check-in
 * section — used ONLY when the property's own Google Sheets "Apartamentos"
 * entry has no parking text filled in for that specific unit. Per-apartment
 * data (r.checkinInfo.parking) always takes priority over this default.
 */

export const PORTO_DAS_DUNAS_PARKING_FALLBACK = `Há estacionamento gratuito na rua em frente do condomínio, com segurança. No entanto, se você precisa de uma vaga de estacionamento segura e paga, a melhor opção é o estacionamento do Beach Park (pago), localizado a apenas 400 metros do condomínio.`

export function resolveParkingFallback(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_PARKING_FALLBACK
  }
  return null
}
