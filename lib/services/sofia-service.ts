// -------------------------------------------------------------------------
// Sofia service (MOCK — concierge brain)
//
// Sofia is presented as an intelligent concierge, never as a chatbot.
// The real implementation will stream responses from an LLM (OpenAI via a
// secure backend), grounded by RAG and tools (Stays, Cielo, Booking...).
// This mock returns short, elegant, scripted replies so the chat UI can be
// exercised end to end. No keys or model calls live in the frontend.
// -------------------------------------------------------------------------

export interface SofiaMessage {
  id: string
  role: 'sofia' | 'user'
  content: string
  createdAt: number
}

export const sofiaGreeting =
  'Olá, sou a Sofia. Vou encontrar a hospedagem ideal para você. Para onde deseja viajar?'

export const sofiaSuggestions = [
  'Quero um apartamento frente mar em Porto das Dunas',
  'Tem cobertura com jacuzzi para 12 pessoas?',
  'Perto do Beach Park, aceita pets?',
  'Quero as melhores opções em julho',
]

const scripted: { match: RegExp; reply: string }[] = [
  {
    match: /jacuzzi|cobertura/i,
    reply:
      'Temos duas coberturas exclusivas com jacuzzi privativa em Porto das Dunas, ideais para até 12 hóspedes. Posso mostrar a Terramaris 302 · Bloco 3 primeiro?',
  },
  {
    match: /beach park|pet/i,
    reply:
      'A poucos minutos do Beach Park encontrei ótimas opções da Reserva Direta Bomgo. Para pets, confirmo as regras de cada unidade antes de reservar.',
  },
  {
    match: /frente mar|porto das dunas|mar/i,
    reply:
      'Perfeito. Selecionei apartamentos frente mar em Porto das Dunas com a melhor avaliação. Quer que eu já filtre pelas datas da sua viagem?',
  },
  {
    match: /julho|data|quando/i,
    reply:
      'Julho é alta temporada por aqui. Posso reservar as unidades com cancelamento flexível para garantir a melhor tarifa. Quantos hóspedes serão?',
  },
  {
    match: /pix|pagar|parcel|cart/i,
    reply:
      'Você pode pagar via Pix com aprovação imediata ou no cartão em até 3x sem juros. De 4x a 12x há juros, calculados na finalização.',
  },
]

export async function askSofia(message: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900))
  const found = scripted.find((s) => s.match.test(message))
  if (found) return found.reply
  return 'Entendi. Estou comparando as melhores opções para você agora mesmo. Posso priorizar frente mar, estrutura para famílias ou o melhor preço?'
}
