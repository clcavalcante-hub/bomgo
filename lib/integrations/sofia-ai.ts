import "server-only"

import { generateText } from "ai"
import { isSofiaAIConfigured, sofiaConfig } from "@/lib/integrations/config"
import { properties, partnerProperties } from "@/lib/data/properties"

/**
 * Sofia's brain — grounded, on-brand concierge responses via the AI SDK.
 *
 * Sofia is a concierge, never a "chatbot". The model is reached through the
 * Vercel AI Gateway using AI_GATEWAY_API_KEY (the SDK reads it from the env
 * automatically). When the key is absent, `askSofiaAI` returns `null` and the
 * route falls back to the curated scripted replies.
 */

function buildCatalog(): string {
  const all = [...properties, ...partnerProperties]
  return all
    .slice(0, 24)
    .map(
      (p) =>
        `- ${p.name} (${p.type}, ${p.destination}${p.neighborhood ? " · " + p.neighborhood : ""}) · até ${p.maxGuests} hóspedes · ${p.bedrooms} quartos · R$ ${p.nightlyPrice}/noite · nota ${p.rating}${p.highlight ? " · " + p.highlight : ""} · fonte ${p.source}`,
    )
    .join("\n")
}

const SYSTEM_PROMPT = `Você é a Sofia, concierge de viagens da Bomgo — uma pessoa sofisticada, calorosa e objetiva, nunca um chatbot genérico.

Diretrizes:
- Fale em português do Brasil, em tom elegante, acolhedor e direto.
- Respostas curtas (2 a 4 frases). Nada de listas longas nem jargão técnico.
- Recomende acomodações reais do catálogo abaixo quando fizer sentido, citando o nome.
- Priorize sempre a "Reserva Direta Bomgo" (fonte bomgo) por ter o melhor preço.
- Sobre pagamento: Pix tem aprovação imediata; cartão em até 3x sem juros, de 4x a 12x com juros.
- Nunca invente preços ou unidades que não estão no catálogo. Se não souber, ofereça ajuda para refinar a busca.
- Jamais use emojis.

Catálogo disponível:
${buildCatalog()}`

/** Returns Sofia's reply, or `null` when the AI is not configured/fails. */
export async function askSofiaAI(
  message: string,
  history?: { role: "sofia" | "user"; content: string }[],
): Promise<string | null> {
  if (!isSofiaAIConfigured()) return null

  const priorTurns = (history ?? [])
    .slice(-6)
    .map((m) => ({
      role: m.role === "sofia" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }))

  try {
    const { text } = await generateText({
      model: sofiaConfig.model,
      system: SYSTEM_PROMPT,
      messages: [...priorTurns, { role: "user", content: message }],
    })
    return text.trim() || null
  } catch (error) {
    console.log("[v0] Sofia AI failed:", (error as Error).message)
    return null
  }
}
