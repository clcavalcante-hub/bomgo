import { describe, expect, it } from "vitest"
import { authoritativePaymentAmount, toPaymentCents } from "./authoritative-amount"

describe("authoritative payment amount", () => {
  it("uses the server amount when both totals match in cents", () => {
    expect(authoritativePaymentAmount(860, 860)).toBe(860)
    expect(authoritativePaymentAmount(860.1, 860.10)).toBe(860.1)
  })

  it("rejects a manipulated browser amount", () => {
    expect(authoritativePaymentAmount(860, 1)).toBeNull()
    expect(authoritativePaymentAmount(860, 859.99)).toBeNull()
  })

  it("rejects invalid totals", () => {
    expect(authoritativePaymentAmount(0, 0)).toBeNull()
    expect(authoritativePaymentAmount(Number.NaN, 860)).toBeNull()
  })

  it("rounds monetary values to cents", () => {
    expect(toPaymentCents(10.005)).toBe(1001)
  })
})
