import { describe, expect, it } from "vitest"
import { mapPixStatus } from "./cielo"

describe("Cielo Pix status", () => {
  it("only treats PaymentConfirmed (2) as paid", () => {
    expect(mapPixStatus(2)).toBe("approved")
    expect(mapPixStatus(1)).toBe("pix-pending")
    expect(mapPixStatus(12)).toBe("pix-pending")
  })

  it("rejects aborted, refunded and unfinished statuses", () => {
    expect(mapPixStatus(0)).toBe("declined")
    expect(mapPixStatus(11)).toBe("declined")
    expect(mapPixStatus(13)).toBe("declined")
  })
})
