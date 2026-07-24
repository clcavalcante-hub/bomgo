import { NextResponse } from "next/server"

const CJ_BASE = "https://www.kqzyfj.com/click-101816482-17293138"

/**
 * GET /ir/[slug] — link curto e bonito de parceiro (Booking.com via CJ Affiliate).
 *
 * A Sofia manda um link enxuto como `bomgobrasil.com/ir/terramaris-duplex?t=h&ci=2026-07-25&co=2026-07-27`;
 * esta rota reconstrói o deep link rastreado da Booking e redireciona (302), preservando o
 * rastreio/comissão da CJ (PID 101816482). Só monta URLs para booking.com — o slug é
 * saneado e o destino é sempre booking.com, então não há open-redirect.
 *
 * Query: t = "h" (hotel, padrão) | "c" (cidade); ci = check-in; co = check-out; a = adultos; ch = crianças
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const safe = String(slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "")
  if (!safe) return NextResponse.redirect("https://www.booking.com/", 302)

  const q = new URL(request.url).searchParams

  let bookingUrl: string
  if (q.get("t") === "c") {
    bookingUrl = `https://www.booking.com/city/br/${safe}.pt-br.html`
  } else {
    const p = new URLSearchParams()
    const ci = q.get("ci")
    const co = q.get("co")
    if (ci) p.set("checkin", ci)
    if (co) p.set("checkout", co)
    p.set("group_adults", q.get("a") || "2")
    p.set("no_rooms", "1")
    p.set("group_children", q.get("ch") || "0")
    bookingUrl = `https://www.booking.com/hotel/br/${safe}.pt-br.html?${p.toString()}`
  }

  return NextResponse.redirect(`${CJ_BASE}?url=${encodeURIComponent(bookingUrl)}`, 302)
}
