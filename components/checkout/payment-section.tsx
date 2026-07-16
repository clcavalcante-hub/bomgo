"use client"

import { useMemo, useState } from "react"
import { Check, Copy, CreditCard, Loader2, QrCode, TriangleAlert } from "lucide-react"
import { buildInstallments, formatBRL } from "@/lib/pricing"
import type { PaymentResult, processPayment } from "@/lib/services/payment-service"
import type { PaymentMethod } from "@/lib/types"
import { cn } from "@/lib/utils"

type PayInput = Parameters<typeof processPayment>[0]

export function PaymentSection({
  total,
  method,
  onMethodChange,
  onPay,
  onPixConfirmed,
  result,
}: {
  total: number
  method: PaymentMethod
  onMethodChange: (m: PaymentMethod) => void
  onPay: (input: PayInput) => Promise<PaymentResult>
  onPixConfirmed: (transactionId: string) => Promise<void>
  result: PaymentResult | null
}) {
  const [processing, setProcessing] = useState(false)
  const [installments, setInstallments] = useState(1)
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" })
  const [declined, setDeclined] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmingPix, setConfirmingPix] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  const options = useMemo(() => buildInstallments(total), [total])

  async function pay() {
    setDeclined(false)
    setRequestError(null)
    setProcessing(true)
    const input: PayInput =
      method === "pix"
        ? { method: "pix", amount: total }
        : {
            method: "card",
            amount: total,
            installments,
            cardNumber: card.number,
            holder: card.holder,
            expiry: card.expiry,
            cvv: card.cvv,
          }
    try {
      const res = await onPay(input)
      if (res.status === "declined") setDeclined(true)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Falha ao processar o pagamento.")
    } finally {
      setProcessing(false)
    }
  }

  async function confirmPixNow() {
    if (!result?.transactionId) return
    setRequestError(null)
    setConfirmingPix(true)
    try {
      await onPixConfirmed(result.transactionId)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Falha ao confirmar o Pix.")
    } finally {
      setConfirmingPix(false)
    }
  }

  function copyPix() {
    if (!result?.pix) return
    navigator.clipboard?.writeText(result.pix.qrCodeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardValid =
    card.number.replace(/\s/g, "").length >= 15 &&
    card.holder.trim().length > 2 &&
    card.expiry.length >= 4 &&
    card.cvv.length >= 3

  const pixPending = method === "pix" && result?.status === "pix-pending"

  return (
    <div className="rounded-md border border-border bg-card p-6">
      {requestError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{requestError}</span>
        </div>
      )}

      {/* Method toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-md bg-secondary/60 p-1.5">
        <button
          type="button"
          onClick={() => onMethodChange("pix")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition",
            method === "pix" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          <QrCode className="size-4" /> Pix
        </button>
        <button
          type="button"
          onClick={() => onMethodChange("card")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition",
            method === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          <CreditCard className="size-4" /> Cartão
        </button>
      </div>

      {/* PIX */}
      {method === "pix" && (
        <div className="mt-6">
          {!pixPending ? (
            <div className="rounded-md bg-secondary/40 p-5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <QrCode className="size-4 text-primary" /> Pagamento instantâneo
              </p>
              <ul className="mt-3 space-y-1.5">
                <li>Aprovação em segundos após o pagamento</li>
                <li>Sem juros e sem taxas adicionais</li>
                <li>O código expira em 15 minutos</li>
              </ul>
              <p className="mt-4 text-lg font-semibold text-foreground">Total à vista: {formatBRL(total)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-md border border-border p-5 text-center">
              <div className="grid size-40 place-items-center rounded-md bg-primary/5">
                <QrCode className="size-28 text-primary" strokeWidth={1} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Escaneie o QR Code ou copie o código Pix</p>
              <div className="mt-3 flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                <span className="flex-1 truncate text-left font-mono text-xs text-foreground">
                  {result?.pix?.qrCodeText}
                </span>
                <button
                  type="button"
                  onClick={copyPix}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <button
                type="button"
                onClick={confirmPixNow}
                disabled={confirmingPix}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-success px-6 py-3.5 text-base font-semibold text-success-foreground transition disabled:opacity-60"
              >
                {confirmingPix ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                {confirmingPix ? "Confirmando pagamento…" : "Já paguei"}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Após o pagamento no seu banco, confirme aqui para concluirmos sua reserva.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CARD */}
      {method === "card" && (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Número do cartão</span>
            <input
              inputMode="numeric"
              value={card.number}
              onChange={(e) =>
                setCard((c) => ({
                  ...c,
                  number: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 16)
                    .replace(/(\d{4})(?=\d)/g, "$1 "),
                }))
              }
              placeholder="0000 0000 0000 0000"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Nome impresso no cartão</span>
            <input
              value={card.holder}
              onChange={(e) => setCard((c) => ({ ...c, holder: e.target.value.toUpperCase() }))}
              placeholder="COMO ESTÁ NO CARTÃO"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Validade</span>
              <input
                inputMode="numeric"
                value={card.expiry}
                onChange={(e) =>
                  setCard((c) => ({
                    ...c,
                    expiry: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4)
                      .replace(/(\d{2})(?=\d)/, "$1/"),
                  }))
                }
                placeholder="MM/AA"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">CVV</span>
              <input
                inputMode="numeric"
                value={card.cvv}
                onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                placeholder="123"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Parcelamento</span>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-primary"
            >
              {options.map((opt) => (
                <option key={opt.installments} value={opt.installments}>
                  {opt.installments}x de {formatBRL(opt.amount)}
                  {opt.hasInterest ? ` (total ${formatBRL(opt.total)})` : " sem juros"}
                </option>
              ))}
            </select>
          </label>

          {declined && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>Pagamento não autorizado. Revise os dados ou tente outro cartão.</span>
            </div>
          )}
        </div>
      )}

      {!pixPending && (
        <button
          type="button"
          onClick={pay}
          disabled={processing || (method === "card" && !cardValid)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/25 transition enabled:hover:scale-[1.01] disabled:opacity-50"
        >
          {processing && <Loader2 className="size-5 animate-spin" />}
          {processing
            ? "Processando…"
            : method === "pix"
              ? `Gerar Pix de ${formatBRL(total)}`
              : `Pagar ${formatBRL(total)}`}
        </button>
      )}
    </div>
  )
}
