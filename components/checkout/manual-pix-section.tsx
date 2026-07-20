"use client"

import { useState } from "react"
import { Check, Copy, Loader2, QrCode, TriangleAlert } from "lucide-react"
import { formatBRL } from "@/lib/pricing"
import { manualPixDetails, isManualPixConfigured } from "@/lib/config/payment-eligibility"

/**
 * Not the automatic Cielo Pix (no QR code generated, no server-side
 * payment call at all). Shows the static Pix key Chris provides so the
 * guest pays manually and sends proof; the reservation is left as a real
 * `pre_reserved` Stays hold until someone on the Bomgo side confirms the
 * transfer by hand and advances it.
 */
export function ManualPixSection({ total, onConfirm }: { total: number; onConfirm: () => void }) {
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const configured = isManualPixConfigured()

  function copyKey() {
    if (!manualPixDetails.key) return
    navigator.clipboard?.writeText(manualPixDetails.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleConfirm() {
    setConfirming(true)
    try {
      onConfirm()
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-medium text-foreground">
        <QrCode className="size-4 text-primary" /> Pagamento via Pix
      </p>

      {!configured ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-cta" />
          <span>Dados do Pix em configuração. Entre em contato pelo WhatsApp para receber a chave de pagamento.</span>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            Este imóvel aceita pagamento por Pix manual. Faça a transferência com os dados abaixo e depois confirme —
            sua reserva fica pré-reservada até confirmarmos o pagamento.
          </p>

          <div className="mt-4 space-y-2 rounded-md bg-secondary/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chave Pix ({manualPixDetails.keyType})</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-foreground">{manualPixDetails.key}</span>
                <button
                  type="button"
                  onClick={copyKey}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Titular</span>
              <span className="font-medium text-foreground">{manualPixDetails.holderName}</span>
            </div>
            {manualPixDetails.bankName && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Banco</span>
                <span className="font-medium text-foreground">{manualPixDetails.bankName}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
              <span className="font-medium text-foreground">Valor a pagar</span>
              <span className="text-base font-semibold text-foreground">{formatBRL(total)}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Depois de pagar, envie o comprovante pelo WhatsApp da Sofia. Assim que confirmarmos, sua reserva passa de
            pré-reservada para confirmada.
          </p>
        </>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/25 transition enabled:hover:scale-[1.01] disabled:opacity-50"
      >
        {confirming ? <Loader2 className="size-5 animate-spin" /> : null}
        {confirming ? "Registrando…" : "Já vou fazer o Pix — registrar pré-reserva"}
      </button>
    </div>
  )
}
