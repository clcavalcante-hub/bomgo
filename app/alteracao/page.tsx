import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, CheckCircle2, Clock3, FileCheck2, LockKeyhole, MessageCircle, Search, TriangleAlert, UserRound } from "lucide-react"
import { formatBRL } from "@/lib/pricing"
import { formatLocalDateLabel } from "@/lib/dates"
import { getChangeCase } from "@/lib/sofia/change-case"
import { getChangePayment } from "@/lib/sofia/change-payment"
import { ChangePaymentPanel } from "./change-payment-panel"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Acompanhar alteração",
  description: "Acompanhe com segurança sua solicitação de alteração de reserva.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sua solicitação de alteração — Bomgo",
    description: "Consulte o protocolo e acompanhe o andamento com segurança.",
    type: "website",
  },
}

const COMPLETE_STATES = new Set(["paid", "applying_change", "completed"])

export default async function AlteracaoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = "" } = await searchParams
  const changeCase = await getChangeCase(token.trim())

  if (!changeCase) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-4 pb-20 pt-24 md:pt-28">
        <section className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm">
          <TriangleAlert className="mx-auto size-9 text-cta" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Para proteger sua reserva, este acesso tem prazo de validade. Peça um novo link à Sofia.
          </p>
          <Link
            href="https://wa.me/5585986045866?text=Preciso%20de%20um%20novo%20link%20da%20minha%20solicita%C3%A7%C3%A3o"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="size-4" /> Falar com a equipe
          </Link>
        </section>
      </main>
    )
  }

  const localPayment = await getChangePayment(changeCase.protocol).catch(() => null)
  const completed = changeCase.status === "completed"
  const paymentConfirmed = COMPLETE_STATES.has(changeCase.status) || localPayment?.status === "approved"
  const approvedAmount = changeCase.approved_amount_brl
  const changesCheckin = changeCase.change_type === "extend_checkin"
  const currentDate = changesCheckin ? changeCase.current_checkin : changeCase.current_checkout
  const requestedDate = changesCheckin ? (changeCase.requested_checkin ?? changeCase.current_checkin) : changeCase.requested_checkout

  return (
    <main className="mx-auto max-w-xl px-4 pb-20 pt-24 md:pt-28">
      <header className="text-center">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <LockKeyhole className="size-3.5" /> Acesso seguro Bomgo
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Alteração da sua reserva</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acompanhe aqui cada etapa da solicitação.</p>
      </header>

      <section className="mt-7 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.14em] text-primary-foreground/70">Protocolo</p>
          <p className="mt-1 break-all font-mono text-sm font-semibold">{changeCase.protocol}</p>
          <span className="mt-4 inline-flex rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-semibold">
            {changeCase.status_label}
          </span>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reserva</p>
            <p className="mt-1 font-mono text-base font-semibold text-foreground">{changeCase.reservation_code}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs text-muted-foreground">{changesCheckin ? "Entrada atual" : "Saída atual"}</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold text-foreground">
                <CalendarDays className="size-4 text-primary" />
                {formatLocalDateLabel(currentDate) ?? currentDate}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs text-muted-foreground">{changesCheckin ? "Nova entrada solicitada" : "Nova saída solicitada"}</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold text-foreground">
                <CalendarDays className="size-4 text-primary" />
                {formatLocalDateLabel(requestedDate) ?? requestedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <div>
              <p className="text-xs text-muted-foreground">Período adicional</p>
              <p className="mt-1 font-semibold text-foreground">
                {changeCase.extra_nights} {changeCase.extra_nights === 1 ? "diária" : "diárias"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {approvedAmount == null ? "Estimativa preliminar" : "Valor final aprovado"}
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {(approvedAmount ?? changeCase.estimated_additional_brl) == null
                  ? "Em análise"
                  : formatBRL(approvedAmount ?? changeCase.estimated_additional_brl!)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm leading-6 text-foreground">
            {completed
              ? "Alteração concluída. Confira a nova data acima."
              : paymentConfirmed
                ? "Pagamento confirmado. A equipe está concluindo a alteração na reserva."
                : changeCase.requires_human_review
                  ? "Como esta reserva veio de uma plataforma parceira, a equipe precisa validar a alteração antes de liberar o pagamento."
                  : "A disponibilidade e o valor ainda serão confirmados antes do pagamento."}
          </div>
        </div>
      </section>

      {changeCase.status === "awaiting_payment" && approvedAmount != null && approvedAmount > 0 && !paymentConfirmed ? (
        <ChangePaymentPanel token={token.trim()} amount={approvedAmount} />
      ) : null}

      <section className="mt-5 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Andamento</h2>
        <ol className="mt-4 space-y-4 text-sm">
          <Step done label="Solicitação registrada" icon={<FileCheck2 className="size-4" />} />
          <Step done={changeCase.available} label="Disponibilidade consultada" icon={<CheckCircle2 className="size-4" />} />
          <Step done={paymentConfirmed} label="Pagamento confirmado" icon={<Clock3 className="size-4" />} />
          <Step done={completed} label="Reserva atualizada" icon={<CalendarDays className="size-4" />} />
        </ol>
      </section>

      <section className="mt-5 rounded-3xl bg-primary p-6 text-primary-foreground">
        <h2 className="text-lg font-bold">Continue com a Bomgo</h2>
        <p className="mt-1 text-sm leading-6 text-primary-foreground/75">
          Encontre sua próxima hospedagem ou acesse suas reservas pelo portal.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/busca"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary"
          >
            <Search className="size-4" /> Nova hospedagem
          </Link>
          <Link
            href="/conta"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            <UserRound className="size-4" /> Minhas reservas
          </Link>
        </div>
      </section>

      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Este link é pessoal, válido por 30 dias e não deve ser compartilhado.
      </p>
    </main>
  )
}

function Step({ done, label, icon }: { done: boolean; label: string; icon: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`flex size-8 items-center justify-center rounded-full ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </span>
      <span className={done ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  )
}
