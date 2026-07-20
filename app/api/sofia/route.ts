import { NextResponse } from "next/server"
import { askSofiaAI } from "@/lib/integrations/sofia-ai"

interface SofiaBody {
  message: string
  history?: { role: "sofia" | "user"; content: string }[]
}

// Scripted fallback — keeps Sofia on-brand when no AI key is configured.
const scripted: { match: RegExp; reply: string }[] = [
  {
    match: /jacuzzi|cobertura/i,
    reply:
      "Temos duas coberturas exclusivas com jacuzzi privativa em Porto das Dunas, ideais para até 12 hóspedes. Posso mostrar a Terramaris 302 · Bloco 3 primeiro?",
  },
  {
    match: /beach park|pet/i,
    reply:
      "A poucos minutos do Beach Park encontrei ótimas opções da Reserva Direta Bomgo. Para pets, confirmo as regras de cada unidade antes de reservar.",
  },
  {
    match: /frente mar|porto das dunas|mar/i,
    reply:
      "Perfeito. Selecionei apartamentos frente mar em Porto das Dunas com a melhor avaliação. Quer que eu já filtre pelas datas da sua viagem?",
  },
  {
    match: /julho|data|quando/i,
    reply:
      "Julho é alta temporada por aqui. Posso já verificar a disponibilidade real e garantir a melhor tarifa. Quantos hóspedes serão?",
  },
  {
    match: /pix|pagar|parcel|cart/i,
    reply:
      "Você pode pagar via Pix com aprovação imediata ou no cartão em até 3x sem juros. De 4x a 12x há juros, calculados na finalização.",
  },
]

function scriptedReply(message: string): string {
  const found = scripted.find((s) => s.match.test(message))
  if (found) return found.reply
  return "Entendi. Estou comparando as melhores opções para você agora mesmo. Posso priorizar frente mar, estrutura para famílias ou o melhor preço?"
}

export async function POST(request: Request) {
  const { message, history } = (await request.json()) as SofiaBody

  const aiReply = await askSofiaAI(message, history)
  if (aiReply) {
    return NextResponse.json({ reply: aiReply, live: true })
  }

  await new Promise((r) => setTimeout(r, 700))
  return NextResponse.json({ reply: scriptedReply(message), live: false })
}

export const dynamic = "force-dynamic"
