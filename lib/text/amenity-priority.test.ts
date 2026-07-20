import { describe, expect, it } from "vitest"
import { sortAmenitiesByPriority } from "./amenity-priority"

describe("sortAmenitiesByPriority", () => {
  it("coloca wifi, ar-condicionado e cozinha antes de amenidades sem prioridade", () => {
    const input = [
      { key: "toboagua", label: "Toboágua" },
      { key: "churrasqueira", label: "Churrasqueira" },
      { key: "cozinha-completa", label: "Cozinha completa" },
      { key: "wifi", label: "Wi-Fi rápido" },
      { key: "ar-condicionado", label: "Ar-condicionado" },
    ]
    const sorted = sortAmenitiesByPriority(input)
    expect(sorted.map((a) => a.key)).toEqual([
      "wifi",
      "ar-condicionado",
      "cozinha-completa",
      "churrasqueira",
      "toboagua",
    ])
  })

  it("mantém a ordem original entre itens sem prioridade (empate estável)", () => {
    const input = [
      { key: "jacuzzi", label: "Jacuzzi" },
      { key: "sofa", label: "Sofá" },
    ]
    expect(sortAmenitiesByPriority(input).map((a) => a.key)).toEqual(["jacuzzi", "sofa"])
  })

  it("não perde nem duplica amenidades", () => {
    const input = [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
      { key: "wifi", label: "Wi-Fi" },
    ]
    expect(sortAmenitiesByPriority(input)).toHaveLength(3)
  })
})
