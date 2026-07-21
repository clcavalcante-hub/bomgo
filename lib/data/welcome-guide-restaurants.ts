/**
 * Restaurants for the welcome guide's "Restaurantes" section, keyed by
 * region. Same source/pricing legend as welcome-guide-bars.ts.
 */

export const PORTO_DAS_DUNAS_RESTAURANTS = `Preços por pessoa, estimativa, sem transporte/serviço. $ até R$50 · $$ R$50–100 · $$$ R$100–180 · $$$$ acima de R$180. Distâncias a partir da área central perto do Beach Park/Av. dos Golfinhos.

ARMONIA LOUNGE & RESTAURANT — Av. dos Golfinhos, 2195. 500m–2,5km (3–8 min de carro). Italiano, massas, pizzas, carnes e frutos do mar, música ao vivo em algumas noites. $$$ (R$ 100–180/pessoa). Tel. (85) 2180-6769 / WhatsApp (85) 99627-5089.

DUMAH RESTAURANTE — Rua Marlin Azul, 1062 (Porto das Dunas Praia Hotel). 1–3km (4–10 min de carro). Cozinha contemporânea mediterrânea, ambiente elegante — bom pra jantar romântico. $$$ (R$ 100–180/pessoa).

RESTAURANTE MIRANTE DO SANTUÁRIO — Av. Caminho do Sol, 5599 (Hotel Santuário das Águias). 3–6km (8–15 min de carro). Vista panorâmica, ótimo pro pôr do sol. $$–$$$ (R$ 70–160/pessoa). Chegue antes do pôr do sol e reserve no fim de semana.

BIRÔ BEACH RESTAURANTE — Rua das Pérolas, 1965. 1–3km (4–10 min de carro). Frutos do mar, peixes, culinária regional. $$–$$$ (R$ 60–140/pessoa). WhatsApp (85) 99620-5920. Dom–qui 8h–20h, sex–sáb 8h–21h.

RESTAURANTE ALECRIM — Av. Caminho do Sol, 2180. 2–4km (5–12 min de carro). Pratos brasileiros e toque alemão/europeu, bom pra família. $$ (R$ 50–100/pessoa). Tel. (85) 3361-7077.

ABSOLUTO PRAIA — Av. Francisco Valcir Machado, 410. 2–5km (6–15 min de carro). Frutos do mar, peixes, carnes, massas. $$–$$$ (R$ 70–150/pessoa).

PIZZARIAS
• Pizzaria da Vila (Vila Azul do Mar) — Rua Porto das Dunas, 2734. $$–$$$ (R$ 60–130/pessoa). Tel. (85) 4012-3000.
• Armonia (também serve pizza) — Av. dos Golfinhos, 2195. $$$ (R$ 90–170/pessoa).
• Bungalow Lounge & Bar — Av. Caminho do Sol, 3717. $$ (R$ 50–110/pessoa).
• Pizzaria Villa Calixto — Rua dos Corais, 368. $–$$ (R$ 35–80/pessoa), opção mais em conta.`

export const MEIRELES_RESTAURANTS = `Preços por pessoa, estimativa, sem transporte/serviço. $ até R$50 · $$ R$50–100 · $$$ R$100–180 · $$$$ acima de R$180. Distâncias a partir do Landscape (Av. Beira-Mar, 2450).

COCO BAMBU MEIRELES — Rua Canuto de Aguiar, 1317. ~1,3km (5–10 min de carro). Pratos fartos, camarão e frutos do mar (muitos servem 2+ pessoas). $$$ (R$ 100–190/pessoa). Tel. (85) 3242-7557. Dom–qui 11h30–23h30, sex–sáb 11h30–meia-noite. Reserva no fim de semana.

COMPLEXO MAREIRO — Av. Beira-Mar, 2380 (Hotel Mareiro), a ~100–200m do Landscape, 2–4 min a pé. Refeições e bebidas perto da orla, sem precisar de transporte. $$–$$$ (R$ 60–150/pessoa).

BRASIL TROPICAL — perto da Av. Abolição, ~250–400m do Landscape (3–6 min a pé). Comida brasileira, bom pra família. $$ (R$ 45–100/pessoa).

BALCONE — Rua Osvaldo Cruz, 919. ~1,5km (5–10 min de carro). Italiano contemporâneo, massas, carnes, frutos do mar — bom pra jantar/romântico. $$$ (R$ 90–180/pessoa).

MERCADO DOS PEIXES — Av. Beira-Mar, 3479, Mucuripe. ~2,5km (7–12 min de carro). Escolha o peixe/camarão no box e pague o preparo à parte — confirme o preço antes de pedir. $$ (R$ 50–120/pessoa, lagosta custa mais).

PIZZARIAS
• Vignoli (Rua Silva Jatahy) — a mais perto do Landscape, ~300–500m. $$–$$$ (R$ 55–120/pessoa).
• Balcone — também serve pizza. $$$ (R$ 80–160/pessoa).
• Coco Bambu — pizza no cardápio também. $$–$$$ (R$ 60–130/pessoa).

POLO GASTRONÔMICO DA VARJOTA
~2–3,5km do Landscape (7–15 min de carro, Uber ~R$ 10–22). Dezenas de restaurantes, cervejarias e gastrobares — uma das melhores regiões pra jantar/sair à noite em Fortaleza.`

export function resolveRestaurantsBody(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_RESTAURANTS
  }
  if (haystack.includes("meireles") || haystack.includes("beira-mar") || haystack.includes("beira mar")) {
    return MEIRELES_RESTAURANTS
  }
  return null
}
