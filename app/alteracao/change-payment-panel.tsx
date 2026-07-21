"use client"

import Image from "next/image"
import { useState } from "react"
import { CheckCircle2, Clipboard, LoaderCircle, QrCode } from "lucide-react"
import { formatBRL } from "@/lib/pricing"

type PaymentState = "idle" | "loading" | "pix-pending" | "approved" | "error"

interface PixPayload {
  qrCodeText: string
  qrCodeBase64?: string | null
}

export function ChangePaymentPanel({ token, amount }: { token: string; amount: number }) {
  const [state, setState] = useState<PaymentState>("idle")
  const [pix, setPix] = useState<PixPayload | null>(null)
  const [message, setMessage] = useState("")

  async function createPix() {
    setState("loading")
    setMessage("")
    try {
      const response = await fetch("/api/sofia/change-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.pix?.qrCodeText) throw new Error(payload?.message || "Não foi possível gerar o Pix.")
      setPix(payload.pix)
      setState("pix-pending")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível gerar o Pix.")
      setState("error")
    }
  }

  async function copyPix() {
    if (!pix?.qrCodeText) return
    await navigator.clipboard.writeText(pix.qrCodeText)
    setMessage("Código Pix copiado.")
  }

  async function confirmPayment() {
    setState("loading")
    setMessage("Consultando o pagamento com segurança…")
    try {
      const response = await fetch("/api/sofia/change-payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error("Não foi possível consultar o pagamento agora.")
      if (payload.status === "approved") {
        setState("approved")
        setMessage("Pagamento confirmado. A equipe concluirá a alteração da reserva.")
        return
      }
      if (payload.status === "declined") {
        setPix(null)
        setState("error")
        setMessage("Este Pix expirou ou foi cancelado. Gere um novo código para continuar.")
        return
      }
      setState("pix-pending")
      setMessage("O pagamento ainda não foi confirmado pela Cielo. Aguarde um instante e tente novamente.")
    } catch (error) {
      setState("pix-pending")
      setMessage(error instanceof Error ? error.message : "Não foi possível consultar o pagamento agora.")
    }
  }

  if (state === "approved") {
    return (
      <section className="mt-5 rounded-3xl border border-success/30 bg-success/10 p-6 text-center">
        <CheckCircle2 className="mx-auto size-9 text-success" />
        <h2 className="mt-3 text-lg font-bold text-foreground">Pagamento confirmado</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
      </section>
    )
  }

  return (
    <section className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <QrCode className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">Pagar diária adicional</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Valor aprovado: <strong className="text-foreground">{formatBRL(amount)}</strong>. O Pix é gerado pela Cielo e vinculado a este protocolo.
          </p>
        </div>
      </div>

      {!pix ? (
        <button
          type="button"
          onClick={createPix}
          disabled={state === "loading"}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <QrCode className="size-4" />}
          {state === "loading" ? "Gerando Pix…" : "Gerar Pix"}
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          {pix.qrCodeBase64 ? (
            <div className="mx-auto w-fit rounded-2xl border border-border bg-white p-3">
              <Image src={pix.qrCodeBase64} alt="QR Code Pix" width={220} height={220} unoptimized />
            </div>
          ) : null}
          <button
            type="button"
            onClick={copyPix}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Clipboard className="size-4" /> Copiar código Pix
          </button>
          <button
            type="button"
            onClick={confirmPayment}
            disabled={state === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary disabled:opacity-60"
          >
            {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Já paguei
          </button>
        </div>
      )}

      {message ? <p className={`mt-4 text-center text-sm ${state === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message}</p> : null}
      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        A reserva só será alterada depois da confirmação do pagamento e de uma nova validação de disponibilidade.
      </p>
    </section>
  )
}
