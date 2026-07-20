import { describe, expect, it } from "vitest"
import { formatPropertyDescription } from "./property-description"

describe("formatPropertyDescription", () => {
  it("remove marcações ## e @@ usadas como pseudo-título, mantendo o texto", () => {
    const raw = "##Localização## Pertinho da praia @@Destaques@@ Wifi rápido"
    const out = formatPropertyDescription(raw)
    expect(out).not.toContain("#")
    expect(out).not.toContain("@")
    expect(out).toContain("Localização")
    expect(out).toContain("Destaques")
    expect(out).toContain("Wifi rápido")
  })

  it("colapsa exclamações e interrogações repetidas", () => {
    expect(formatPropertyDescription("Incrível!!!! Você vai amar????")).toBe("Incrível! Você vai amar?")
  })

  it("remove repetição imediata da mesma palavra", () => {
    expect(formatPropertyDescription("apartamento apartamento muito muito bom")).toBe("apartamento muito bom")
  })

  it("corrige typos comuns sem tocar o resto do texto", () => {
    expect(formatPropertyDescription("area de descanço no terreo")).toBe("área de descanso no térreo")
  })

  it("não altera texto já limpo", () => {
    const clean = "Apartamento espaçoso com vista para o mar, a poucos passos da praia."
    expect(formatPropertyDescription(clean)).toBe(clean)
  })
})
