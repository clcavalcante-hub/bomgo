// -------------------------------------------------------------------------
// Sofia service (client entry point — concierge brain)
//
// Sofia is a concierge, never a chatbot. Her replies are generated
// server-side in `app/api/sofia/route.ts`, which uses the AI SDK via the
// Vercel AI Gateway (grounded by the real catalog) when AI_GATEWAY_API_KEY
// is set, and falls back to curated, on-brand scripted answers otherwise.
// No keys or model calls ever touch the frontend.
// -------------------------------------------------------------------------

export const sofiaGreeting =
  "Olá, sou a Sofia. Vou encontrar a hospedagem ideal para você. Para onde deseja viajar?"

export const sofiaSuggestions = [
  "Quero um apartamento frente mar em Porto das Dunas",
  "Tem cobertura com jacuzzi para 12 pessoas?",
  "Perto do Beach Park, aceita pets?",
  "Quero as melhores opções em julho",
]

export async function askSofia(
  message: string,
  sessionId: string,
): Promise<string> {
  try {
    const res = await fetch("/api/sofia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    })
    // 504 é a consulta de disponibilidade demorando mais que o limite — vale
    // pedir para repetir, e não mandar o hóspede embora para o WhatsApp.
    if (res.status === 504) {
      return "A consulta de disponibilidade está demorando mais que o normal. Me manda a mensagem de novo que eu tento outra vez."
    }
    if (!res.ok) throw new Error("bad status")
    const data = (await res.json()) as { reply: string }
    return data.reply
  } catch {
    return "Não consegui responder agora. Você pode tentar novamente ou continuar pelo WhatsApp da Bomgo."
  }
}
