"use client"

import { useState } from "react"
import { Loader2, MessageCircle, QrCode } from "lucide-react"
import { formatBRL } from "@/lib/pricing"

/**
 * Not the automatic Cielo Pix (no QR code generated, no server-side
 * payment call at all). The property contacts the guest directly to pass
 * along payment details — the reservation is left as a real `pre_reserved`
 * Stays hold until someone on the Bomgo side confirms the payment by hand
 * and advances it.
 */
export function ManualPixSection({ total, onConfirm }: { total: number; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)

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

      <div className="mt-4 flex items-start gap-3 rounded-md bg-secondary/40 p-4 text-sm text-muted-foreground">
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          Pré-reserve suas datas agora. A propriedade vai entrar em contato para passar os dados de pagamento do
          Pix.
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="font-medium text-foreground">Valor a pagar</span>
        <span className="text-base font-semibold text-foreground">{formatBRL(total)}</span>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/25 transition enabled:hover:scale-[1.01] disabled:opacity-50"
      >
        {confirming ? <Loader2 className="size-5 animate-spin" /> : null}
        {confirming ? "Registrando…" : "Pré-reservar agora"}
      </button>
    </div>
  )
}
