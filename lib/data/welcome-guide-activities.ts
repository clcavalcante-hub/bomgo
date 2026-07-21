/**
 * Activities/attractions for the welcome guide's "Atividades" section,
 * keyed by region (same matching as welcome-guide-transport.ts). Prices and
 * hours are approximate and change often — always phrased that way, per
 * Chris's source material (consultado em 21/07/2026), and the guide should
 * point the guest to the official site/WhatsApp before buying.
 */

export const PORTO_DAS_DUNAS_ACTIVITIES = `Preços e horários mudam com frequência — confirme sempre no site ou WhatsApp oficial antes de comprar.

BEACH PARK — AQUA PARK
Rua Porto das Dunas, 2734, Porto das Dunas, Aquiraz. Mais de 30 atrações, piscinas, rio lento e toboáguas.
Ingresso antecipado: a partir de ~R$ 230 (Pix) / R$ 240 (cartão). No dia: ~R$ 310–325. Crianças até 1m de altura, grátis com adulto pagante.
Funciona normalmente das 11h às 17h (bilheteria abre 10h30).
Estacionamento ~R$ 50/dia. Ingressos: ingresso.beachpark.com.br — (85) 4012-3030

PARQUE ARVORAR
Parque ecológico do complexo Beach Park, contato com aves e natureza.
Ingresso antecipado a partir de ~R$ 109. Combo com Aqua Park disponível.

VILA AZUL DO MAR
Open mall do Beach Park, entrada gratuita — restaurantes, pizzaria, cafés, lojas e apresentações.

ENGENHOCA PARQUE E MUSEU DO ENGENHO COLONIAL
Rua Raimundo Coelho, 200, Centro, Aquiraz — (85) 3361-1010
Parque ecológico e de aventura com trilhas, tirolesa, arvorismo, caiaque, fazendinha e o Museu do Engenho Colonial (antigo engenho da Cachaça Colonial).
Ingresso Conhecer: R$ 48 (inteira) / R$ 24 (meia). Combo Aventura: R$ 130 (inteira) / R$ 106 (meia).
Sexta a domingo e feriados, geralmente 10h30–17h (em jan/jul/dez, quarta a domingo).

PRAIAS
• Praia de Porto das Dunas — extensa, dunas, barracas, passeios de buggy e quadriciclo.
• Praia do Japão — mais tranquila, 10–20 min de carro.
• Prainha de Aquiraz — barracas, artesanato, 20–30 min de carro.

PASSEIOS DE BUGGY E QUADRICICLO
Contrate só operadores credenciados (peça o Cadastur), confirme preço/roteiro antes e nunca pague adiantado a contato não verificado. Pergunte na recepção por uma indicação atualizada.

CENTRO HISTÓRICO DE AQUIRAZ
Primeira capital do Ceará — Igreja Matriz de São José de Ribamar, Praça Cônego Eduardo Araripe, Museu Sacro (terça a sábado) e Mercado das Artes.`

export const MEIRELES_ACTIVITIES = `Preços e horários mudam com frequência — confirme sempre no site ou WhatsApp oficial antes de comprar.

CALÇADÃO E FEIRINHA DA BEIRA-MAR
Av. Beira-Mar, Meireles. Ótima para caminhada, corrida, ciclismo e contemplação do mar. Feira à tarde/noite com artesanato, moda praia e comidas regionais.

SHOWS DE HUMOR
• Teatro do Humor Cearense — Beira Mar Trade Center, Meireles. WhatsApp (85) 98866-2466.
• Lupus Bier — Praia de Iracema, show + buffet ~R$ 84,99/pessoa. WhatsApp (85) 99700-7615.

MERCADO CENTRAL DE FORTALEZA
Av. Alberto Nepomuceno, 199, Centro. Rendas, redes, couro, doces e artesanato cearense.

MERCADO DOS PINHÕES
Praça Visconde de Pelotas — espaço cultural com forró, samba, feiras gastronômicas e orgânicas em datas específicas (confira a agenda antes de ir).

PASSEIOS DE BARCO E VELEIRO (saída do Mucuripe)
• Veleiro Pérola Negra — WhatsApp (85) 99985-5003
• Veleiro Philosophy — WhatsApp (85) 98221-2227
• Associação dos Veleiros de Fortaleza — ~R$ 69,90/pessoa, WhatsApp (85) 98784-8787

ESPORTES NÁUTICOS
Ceará SUP Club (stand-up paddle, caiaque, canoa havaiana) — Av. Beira-Mar, 3958, Mucuripe. WhatsApp (85) 98820-8212.

MERCADO DOS PEIXES
Av. Beira-Mar, 3479, Mucuripe — compre peixe/frutos do mar e peça pra preparar na hora. Ótimo pro pôr do sol.

POLO GASTRONÔMICO DA VARJOTA
5–15 min da Beira-Mar — dezenas de restaurantes (cearense, frutos do mar, italiano, japonês, bares e música ao vivo), concentrados na Rua Frederico Borges e Rua Ana Bilhar.`

export function resolveActivitiesBody(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_ACTIVITIES
  }
  if (haystack.includes("meireles") || haystack.includes("beira-mar") || haystack.includes("beira mar")) {
    return MEIRELES_ACTIVITIES
  }
  return null
}
