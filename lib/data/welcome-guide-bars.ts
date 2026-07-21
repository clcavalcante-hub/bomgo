/**
 * Bars/nightlife for the welcome guide's "Bares e Clubes" section, keyed by
 * region. Prices/hours are estimates (Chris's source, 21/07/2026, câmbio
 * aprox. US$1=R$5,20) — phrased as such, confirmar sempre antes de sair.
 */

export const PORTO_DAS_DUNAS_BARS = `Preços por pessoa, estimativa, sem transporte/serviço. $ até R$50 · $$ R$50–100 · $$$ R$100–180 · $$$$ acima de R$180.

Porto das Dunas tem vida noturna mais tranquila — as opções de bar ficam mais concentradas na Vila Azul do Mar e em alguns restaurantes com música ao vivo:

BUNGALOW LOUNGE & BAR
Av. Caminho do Sol, 3717. Ambiente descontraído e noturno, pizzas, pratos brasileiros, petiscos e bebidas. $$ (R$ 50–110/pessoa). Confirme horário e programação antes de ir.

VILA AZUL DO MAR
Rua Porto das Dunas, 2734 — (85) 4012-3000. Coqueiral Bar e Restaurante, cafeterias e sorveterias, com apresentações culturais e música em dias selecionados. Acesso gratuito. $$–$$$ (R$ 60–150/pessoa).

ARMONIA LOUNGE & RESTAURANT
Av. dos Golfinhos, 2195 — (85) 2180-6769 / WhatsApp (85) 99627-5089. Além do restaurante italiano, tem drinks e música ao vivo em algumas noites. $$$ (R$ 100–180/pessoa). Reserva recomendada fim de semana.

Pra vida noturna mais movimentada (casas noturnas, baladas), a melhor opção é ir até Fortaleza (Meireles/Aldeota/Varjota) — 30-40 min de carro. Peça uma indicação atualizada na recepção ou fale com a Sofia.`

export const MEIRELES_BARS = `Preços por pessoa, estimativa, sem transporte/serviço. $ até R$50 · $$ R$50–100 · $$$ R$100–180 · $$$$ acima de R$180. Distâncias a partir do Landscape (Av. Beira-Mar, 2450).

BOTECO PRAIA — Av. Beira-Mar, 1680. ~1 km (4–8 min de carro, 12–18 min a pé). Petiscos, cervejas, drinks, música ao vivo em dias selecionados. $$ (R$ 50–110/pessoa), pode passar de R$ 150 com drinks/couvert.

ÓRBITA BLUE — calçadão da Beira-Mar. ~1,5–2,5 km (5–10 min de carro). Drinks e vista pro mar, ótimo pro fim de tarde. $$ (R$ 50–120/pessoa). Tel. (85) 99665-2836.

MOLESKINE GASTROBAR — Rua Prof. Dias da Rocha, 578. ~1,8 km (6–12 min de carro). Gastronomia contemporânea e drinks autorais, bom pra casal/comemoração. $$$ (R$ 100–180/pessoa, pode passar de R$ 200 com vinho). WhatsApp (85) 99105-5443 — reserva recomendada fim de semana.

FUZUÊ BAR — Rua Barão de Aracati, 609. ~2–3 km (7–15 min de carro). Ambiente jovem, música e drinks. $$ (R$ 50–120/pessoa). Pode ter couvert/consumo mínimo — confira a programação nas redes antes.

CERVEJARIA TURATTI (Varjota) — Rua Ana Bilhar, 1178. ~2,5 km (8–15 min de carro). Cervejaria artesanal, chope, petiscos, música ao vivo em dias selecionados. $$–$$$ (R$ 70–150/pessoa). WhatsApp (85) 98117-2829.

CLUBES E CASAS NOTURNAS (Aldeota, Varjota, Praia de Iracema)
Programação por evento — confirme antes: evento da noite, estilo musical, preço antecipado x na porta, lista/ingresso, classificação etária, documento exigido, vestimenta, horário e consumo mínimo.
Distância do Landscape: Aldeota/Varjota 2–4 km (8–18 min); Praia de Iracema 3–5 km (10–20 min). Uber ~R$ 12–30, pode passar de R$ 40 na saída.
Custo médio da noite por pessoa: entrada R$ 30–100, drinks R$ 25–50, cerveja R$ 12–25 — total moderado R$ 100–250 (mesas/camarotes custam bem mais).

Segurança: não dirija após beber, confira motorista/placa antes de entrar no carro, peça o veículo dentro do estabelecimento, evite ruas vazias de madrugada e não deixe celular/carteira sobre a mesa.`

export function resolveBarsBody(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_BARS
  }
  if (haystack.includes("meireles") || haystack.includes("beira-mar") || haystack.includes("beira mar")) {
    return MEIRELES_BARS
  }
  return null
}
