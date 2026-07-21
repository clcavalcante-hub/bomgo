/**
 * "Compras" section — supermarket/pharmacy already live in the "Informação"
 * section (welcome-guide-info.ts), so this only adds what's NOT covered
 * there: gifts/souvenirs/artesanato and malls, per Chris's call (21/07/2026)
 * to not duplicate content across sections.
 */

export const PORTO_DAS_DUNAS_SHOPPING = `Supermercado e farmácia já estão na seção Informação.

Aqui vai o que é mais pra presente/lembrança:

CACAU SHOW — Eco Beach Mall, Av. Caminho do Sol, 3980, loja 09. WhatsApp (85) 99911-7819. Chocolates e presentes.

MERCADO DAS ARTES — Centro Histórico de Aquiraz, perto da Praça Cônego Eduardo Araripe. Artesanato local.

ECO BEACH MALL — Av. Caminho do Sol, 3980, Porto das Dunas — reúne supermercado, Normatel e Cacau Show num só lugar, perto da rotatória de acesso ao Beach Park.`

export const MEIRELES_SHOPPING = `Supermercado e farmácia já estão na seção Informação.

Aqui vai o que é mais pra presente/lembrança e shopping:

FEIRINHA DA BEIRA-MAR — Av. Beira-Mar, s/n, Meireles, principalmente fim de tarde/noite. Artesanato, moda praia, rendas, bordados, castanhas e lembranças do Ceará.

MERCADO CENTRAL DE FORTALEZA — Av. Alberto Nepomuceno, 199, Centro. Rendas, redes, couro, doces, cachaças e artesanato — melhor visitar de dia, de app/táxi.

SHOPPING ALDEOTA E SHOPPING DEL PASEO — opções de shopping tradicional perto do Meireles, com lojas variadas, praça de alimentação e caixas eletrônicos.`

export function resolveShoppingBody(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_SHOPPING
  }
  if (haystack.includes("meireles") || haystack.includes("beira-mar") || haystack.includes("beira mar")) {
    return MEIRELES_SHOPPING
  }
  return null
}
