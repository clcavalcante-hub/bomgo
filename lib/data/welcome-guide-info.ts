/**
 * Essential services (pharmacy, bank, post office, gas station, market) for
 * the welcome guide's "Informação" section, keyed by region — same matching
 * as transport/activities. Phone numbers/hours can change; the source
 * material (Chris, 21/07/2026) already flags which ones to double-check.
 */

export const PORTO_DAS_DUNAS_INFO = `FARMÁCIA
Drogasil (referência principal) — Av. Caminho do Sol, 3950 e também nº 77, Porto das Dunas. Confirme horário no site: drogasil.com.br/nossas-lojas
Alternativa: Pague Menos.

BANCO / CAIXA ELETRÔNICO
Não há rede bancária ampla no Porto das Dunas. Caixa eletrônico dentro do Beach Park (Vila Azul do Mar) — (85) 4012-3000, sujeito ao horário do complexo. Melhor levar cartão/Pix ou sacar antes de chegar. Para serviço bancário completo: Centro de Aquiraz ou Fortaleza.

CORREIOS
Sem agência no Porto das Dunas — a mais próxima fica no Centro de Aquiraz, ~12–16 km / 20–30 min de carro. Busca de agências: mais.correios.com.br

POSTO DE GASOLINA (CE-025)
• Posto Praia Porto das Dunas — Av. Caminho do Sol, 2302 — (85) 99218-3981
• Posto Shell (Posto das Dunas Beach) — Av. Caminho do Sol, 3706 — (85) 3361-7369, ~6h–22h
• Posto Maluaga — no trecho inicial da CE-025

SUPERMERCADO
• Supermercado Pinheiro — Eco Beach Mall, Av. Caminho do Sol, 3980 — (85) 4008-2414
• Mercadinho São Luiz — Av. Caminho do Sol/CE-025
• Carnaúba Supermercados — Av. Caminho do Sol

MATERIAL DE CONSTRUÇÃO
Normatel — Eco Beach Mall, loja 24 — (85) 3031-9999

LIXO
Descarte só no local indicado pelo condomínio/hospedagem. Sacos bem fechados, sem deixar em corredores/áreas comuns, vidro/cortantes embalados à parte, sem móveis ou entulho. Dúvida: fale com a portaria.`

export const MEIRELES_INFO = `FARMÁCIA
Drogasil, perto do Landscape (Av. Beira-Mar, 2450 — referência).
Pague Menos — Av. Beira-Mar, 2610, Meireles — 4002-8282.
Outras opções nas avenidas Abolição, Desembargador Moreira, Santos Dumont e Rui Barbosa.

BANCO / CAIXA ELETRÔNICO
Banco do Brasil, atrás do Landscape — Av. da Abolição, 2308, Meireles.
Também há caixas no Shopping Aldeota, Shopping Del Paseo, supermercados e postos de gasolina.

CORREIOS
Unidades na região central e perto do Meireles (referência: Av. Santos Dumont/Osvaldo Cruz). Busca oficial: mais.correios.com.br

POSTO DE GASOLINA
Vários nas avenidas Abolição, Santos Dumont, Virgílio Távora, Dom Luís e Desembargador Moreira.
Referência: Posto São Domingos Jangada — Av. da Abolição, 2432, Meireles, perto do Landscape.

SUPERMERCADO
Pão de Açúcar — Av. da Abolição, 2900. Também Supermercados São Luiz na região, mercadinhos nas avenidas Abolição e Beira-Mar, e Shopping Aldeota/Del Paseo pra compras variadas.

LIXO
Descarte só no local indicado pelo condomínio. Não deixe sacos no corredor, respeite os horários do condomínio, embale vidro/cortantes com segurança, tire o excesso de areia da praia antes de entrar e não jogue areia no ralo. Móveis/entulho: fale antes com a administração.`

export function resolveInfoBody(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_INFO
  }
  if (haystack.includes("meireles") || haystack.includes("beira-mar") || haystack.includes("beira mar")) {
    return MEIRELES_INFO
  }
  return null
}
