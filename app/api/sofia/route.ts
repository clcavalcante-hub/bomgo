import { NextResponse } from "next/server"

interface SofiaBody {
  message?: string
  sessionId?: string
}

const SOFIA_WEBHOOK_URL =
  process.env.SOFIA_WEB_CHAT_WEBHOOK_URL ||
  "https://n8n.bomgobrasil.com/webhook/sofia3-web-chat-v1"

const noStore = { headers: { "Cache-Control": "no-store" } }

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
      signal: AbortSignal.timeout(40_000),
    })
    const payload = (await response.json().catch(() => null)) as { reply?: string; live?: boolean } | null
    if (!response.ok || !payload?.reply) {
      return NextResponse.json({ error: "sofia-unavailable" }, { status: 502, ...noStore })
    }
    return NextResponse.json({ reply: payload.reply, live: true }, noStore)
  } catch {
    return NextResponse.json({ error: "sofia-unavailable" }, { status: 502, ...noStore })
  }
}

export const dynamic = "force-dynamic"
