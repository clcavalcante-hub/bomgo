import { MessagesSquare, Search, ShieldCheck } from "lucide-react"
import { BOOKING_PARTNER_LABEL } from "@/lib/affiliates"

/**
 * Como a Bomgo ajuda + a parceria Booking.
 *
 * As duas coisas ficam juntas de propósito. O visitante que acabou de entender
 * "vocês me ajudam a escolher" faz logo a pergunta seguinte: "e onde eu reservo?".
 * Responder ali, com a parceria declarada de forma positiva, é o que transforma
 * a Booking de link escondido em elemento de confiança — que é exatamente o
 * papel dela nesse modelo.
 *
 * A numeração é real: são três etapas em sequência, não decoração.
 */

const STEPS = [
  {
    icon: Search,
    title: "Conte como será sua viagem",
    body: "Quantas pessoas, idade das crianças, quantos dias e o que não pode faltar.",
  },
  {
    icon: MessagesSquare,
    title: "A Sofia analisa as opções",
    body: "Ela compara localização, estrutura e perfil — e diz quando um apartamento faz mais sentido que um resort.",
  },
  {
    icon: ShieldCheck,
    title: "Você escolhe e reserva com segurança",
    body: "Direto com a Bomgo nos nossos apartamentos, ou na Booking.com nas opções de parceiros.",
  },
]

export function HowBomgoHelps() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <h2 className="text-balance font-serif text-2xl font-bold md:text-3xl">
          Escolha com orientação. Reserve com confiança.
        </h2>
        <p className="mt-3 max-w-prose text-[17px] leading-relaxed text-muted-foreground">
          A Bomgo ajuda você a conhecer destinos, comparar hospedagens e escolher a opção mais
          adequada. Nas opções da Booking.com, você consulta preços e disponibilidade e conclui a
          reserva no ambiente da plataforma.
        </p>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3">
              <span className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <s.icon className="size-5 text-primary" aria-hidden="true" />
              </span>
              <span className="font-semibold">{s.title}</span>
              <span className="text-[15px] leading-relaxed text-muted-foreground">{s.body}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 rounded-xl border border-border bg-background p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Bomgo Brasil — {BOOKING_PARTNER_LABEL}
            </p>
            <p className="mt-1 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
              Participamos do Programa de Parceiros Afiliados da Booking.com. Ao escolher uma opção
              disponível lá, você é direcionado à plataforma para consultar preços, condições e
              concluir a reserva.
            </p>
          </div>
          <a
            href="/divulgacao-de-afiliados"
            className="shrink-0 self-start text-sm font-semibold text-primary underline-offset-4 hover:underline md:self-center"
          >
            Como funciona
          </a>
        </div>
      </div>
    </section>
  )
}
