import "server-only"

import { generateText } from "ai"
import { isSofiaAIConfigured, sofiaConfig } from "@/lib/integrations/config"

/**
 * Stays' raw listing descriptions come as one run-on paragraph: internal
 * codes ("JN04F - BEACH LIVING A 1104"), ALL-CAPS shouting, amenities, house
 * rules and fees all mixed together with no structure. This reformats that
 * same content — never invents, adds, or drops information — into short
 * paragraphs under a couple of plain headings, so it reads like a page a
 * person wrote instead of an export dump.
 */

const SYSTEM_PROMPT = `Você reformata descrições de imóveis de temporada que vêm cruas de um sistema de reservas (Stays), sem nenhuma edição humana.

REGRAS ABSOLUTAS:
- NUNCA invente, adicione ou remova informação. Só reorganize o que já está escrito.
- Remova apenas: código interno do anúncio no início (ex: "JN04F - BEACH LIVING A 1104"), saudações genéricas de boas-vindas ("Olá, sejam bem vindos...", emojis tipo ;D).
- Corrija texto TODO EM MAIÚSCULA para caixa normal (Title Case ou frase normal), exceto siglas reais (TV, WiFi, m², AL, CE).
- Organize em até 3 seções curtas, cada uma com um título em Markdown (## Título) seguido de 1-3 parágrafos curtos (2-4 frases cada). Sugestões de título conforme o conteúdo: "Sobre o espaço", "Comodidades do condomínio", "Regras e taxas importantes". Use só os títulos que fizerem sentido pro conteúdo real.
- Nunca use bullet points nem listas — só parágrafos corridos, curtos.
- Mantenha o tom informativo e direto, sem exagero publicitário.
- Responda APENAS com o texto formatado em Markdown, sem comentário nenhum antes ou depois.`

const cache = new Map<string, string>()

export async function formatPropertyDescription(raw: string): Promise<string | null> {
  if (!raw || raw.trim().length < 20) return null
  if (!isSofiaAIConfigured()) return null

  const cached = cache.get(raw)
  if (cached) return cached

  try {
    const { text } = await generateText({
      model: sofiaConfig.model,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: raw }],
    })
    const formatted = text.trim() || null
    if (formatted) cache.set(raw, formatted)
    return formatted
  } catch (error) {
    console.log("[v0] Description formatter failed:", (error as Error).message)
    return null
  }
}
