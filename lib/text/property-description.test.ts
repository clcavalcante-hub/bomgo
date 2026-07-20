import { describe, expect, it } from "vitest"
import { sanitizeDescriptionText } from "./property-description"

describe("sanitizeDescriptionText", () => {
  it("remove marcações ## e @@ usadas como pseudo-título, mantendo o texto", () => {
    const raw = "##Localização## Pertinho da praia @@Destaques@@ Wifi rápido"
    const out = sanitizeDescriptionText(raw)
    expect(out).not.toContain("#")
    expect(out).not.toContain("@")
    expect(out).toContain("Localização")
    expect(out).toContain("Destaques")
    expect(out).toContain("Wifi rápido")
  })

  it("colapsa exclamações e interrogações repetidas", () => {
    expect(sanitizeDescriptionText("Incrível!!!! Você vai amar????")).toBe("Incrível! Você vai amar?")
  })

  it("remove repetição imediata da mesma palavra", () => {
    expect(sanitizeDescriptionText("apartamento apartamento muito muito bom")).toBe("apartamento muito bom")
  })

  it("corrige typos comuns sem tocar o resto do texto", () => {
    expect(sanitizeDescriptionText("area de descanço no terreo")).toBe("área de descanso no térreo")
  })

  it("não altera texto já limpo", () => {
    const clean = "Apartamento espaçoso com vista para o mar, a poucos passos da praia."
    expect(sanitizeDescriptionText(clean)).toBe(clean)
  })
})
