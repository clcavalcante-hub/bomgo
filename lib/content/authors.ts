import type { Byline } from "./types"

// Quem assina o conteúdo.
//
// Não é formalidade: em conteúdo de viagem o Google pesa quem escreve e por que
// essa pessoa entende do assunto. Um guia do Beach Park assinado por quem
// administra hospedagem em Porto das Dunas desde 2010 carrega uma credencial que
// nenhuma OTA consegue replicar — elas têm escala, não têm vivência do lugar.
//
// Por isso a `credential` é sempre um fato verificável, nunca adjetivo. "Desde
// 2010" pode ser conferido; "especialista renomado" não significa nada.

export const CHRISTIANO: Byline = {
  name: "Christiano Cavalcante",
  role: "CEO & Fundador da Bomgo Brasil",
  credential:
    "Administra hospedagens em Porto das Dunas e na Beira-Mar de Fortaleza desde 2010.",
}

/**
 * Ano de início da operação. Fica aqui para que "há X anos" seja calculado, e
 * não escrito à mão — texto com número fixo envelhece sem ninguém perceber.
 */
export const OPERATING_SINCE = 2010

export function yearsOperating(now: Date = new Date()): number {
  return now.getFullYear() - OPERATING_SINCE
}

/**
 * A Sofia deliberadamente NÃO assina conteúdo.
 *
 * Ela é apresentada com transparência como inteligência artificial em todos os
 * canais; assinar guia como se fosse pessoa contradiria isso e enfraqueceria
 * justamente a confiança que a autoria existe para construir. A Sofia aparece
 * como serviço dentro do conteúdo (bloco de recomendação), não como autora.
 */
