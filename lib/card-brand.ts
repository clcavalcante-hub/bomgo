/** Detect card brand from BIN. Shared by the checkout UI (live badge as the
 * guest types) and the Cielo adapter (explicit Brand field required by some
 * merchant configs). No server-only import — safe for client components. */
export function detectCardBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\D/g, "")
  if (/^4/.test(n)) return "Visa"
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "Master"
  if (/^3[47]/.test(n)) return "Amex"
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return "Elo"
  if (/^(30[0-5]|36|38)/.test(n)) return "Diners"
  if (/^(6011|65|64[4-9])/.test(n)) return "Discover"
  if (/^35(2[89]|[3-8]\d)/.test(n)) return "JCB"
  if (/^50[0-9]/.test(n)) return "Aura"
  return "Visa"
}

/** Same detection, but returns null instead of guessing — for UI display
 * where showing nothing is better than showing a wrong guess. */
export function detectCardBrandForDisplay(cardNumber: string): string | null {
  const n = cardNumber.replace(/\D/g, "")
  if (n.length < 2) return null
  if (/^4/.test(n)) return "Visa"
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "Mastercard"
  if (/^3[47]/.test(n)) return "Amex"
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return "Elo"
  if (/^(30[0-5]|36|38)/.test(n)) return "Diners"
  if (/^(6011|65|64[4-9])/.test(n)) return "Discover"
  if (/^35(2[89]|[3-8]\d)/.test(n)) return "JCB"
  if (/^50[0-9]/.test(n)) return "Aura"
  return null
}
