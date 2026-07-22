import { NextResponse } from "next/server"

interface SofiaBody {
  message?: string
  sessionId?: string
}

const SOFIA_WEBHOOK_URL =
  process.env.SOFIA_WEB_CHAT_WEBHOOK_URL ||
  "https://n8n.bomgobrasil.com/webhook/sofia3-web-chat-v1"

const noStore = { headers: { "Cache-Control": "no-store" } }

// Abaixo do `maxDuration` declarado no fim do arquivo, com folga para a
// resposta de erro sair antes de a plataforma encerrar a função.
const UPSTREAM_TIMEOUT_MS = 50_000

export async function POST(request: Request) {
  let body: SofiaBody
  try {
    body = (await request.json()) as SofiaBody
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400, ...noStore })
  }

  const message = String(body.message || "").trim()
  const sessionId = String(body.sessionId || "").trim()
  if (!message || message.length > 2_000) {
    return NextResponse.json({ error: "invalid-message" }, { status: 400, ...noStore })
  }
  if (!/^[a-zA-Z0-9:_-]{16,100}$/.test(sessionId)) {
    return NextResponse.json({ error: "invalid-session" }, { status: 400, ...noStore })
  }

  const clientIp = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 100)

  try {
    const response = await fetch(SOFIA_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, clientIp }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
    const payload = (await response.json().catch(() => null)) as { reply?: string; live?: boolean } | null
    if (!response.ok || !payload?.reply) {
      return NextResponse.json({ error: "sofia-unavailable" }, { status: 502, ...noStore })
    }
    return NextResponse.json({ reply: payload.reply, live: true }, noStore)
  } catch (error) {
    // Consultar disponibilidade na Stays leva de 15 a 25 segundos, então um
    // estouro de tempo aqui é a pergunta mais comum do site — não um defeito.
    // Vale uma resposta própria, em vez do aviso genérico de indisponibilidade.
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
    if (timedOut) {
      return NextResponse.json({ error: "sofia-timeout", retryable: true }, { status: 504, ...noStore })
    }
    return NextResponse.json({ error: "sofia-unavailable" }, { status: 502, ...noStore })
  }
}

export const dynamic = "force-dynamic"

// A Vercel encerra a função no `maxDuration`; sem isso o padrão é 10s e toda
// pergunta de disponibilidade era cortada antes de a Sofia conseguir responder.
// O timeout interno fica abaixo do limite da plataforma para que o erro seja
// nosso, tratado, em vez de a função ser morta sem resposta.
export const maxDuration = 60
