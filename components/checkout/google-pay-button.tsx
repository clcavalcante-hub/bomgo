"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, TriangleAlert } from "lucide-react"

// Loads Google's Pay JS API and renders the official Google Pay button.
// Token is generated entirely client-side by Google and handed to Cielo's
// gateway (tokenizationSpecification.gateway = "cielo") — we never see raw
// card data for this flow.
//
// NOTE: environment is "TEST" until this has been validated end-to-end with
// a real charge. Switch to "PRODUCTION" only after confirming Cielo accepts
// the token shape in `createGooglePaySale` (lib/integrations/cielo.ts).
const GOOGLE_PAY_ENV: "TEST" | "PRODUCTION" = "TEST"

declare global {
  interface Window {
    google?: any
  }
}

export function GooglePayButton({
  amount,
  installments,
  onToken,
  disabled,
}: {
  amount: number
  installments: number
  onToken: (googlePayToken: string) => void
  disabled?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  const gatewayMerchantId = process.env.NEXT_PUBLIC_CIELO_MERCHANT_ID ?? ""

  useEffect(() => {
    if (!gatewayMerchantId) {
      setStatus("unavailable")
      return
    }
    let cancelled = false

    function baseCardMethod() {
      return {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX", "ELO"],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "cielo",
            gatewayMerchantId,
          },
        },
      }
    }

    function init() {
      if (cancelled || !window.google?.payments?.api) return
      const client = new window.google.payments.api.PaymentsClient({ environment: GOOGLE_PAY_ENV })
      client
        .isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [baseCardMethod()],
        })
        .then((res: { result: boolean }) => {
          if (cancelled) return
          if (!res.result) {
            setStatus("unavailable")
            return
          }
          const button = client.createButton({
            buttonColor: "black",
            buttonType: "pay",
            buttonSizeMode: "fill",
            onClick: () => {
              setError(null)
              client
                .loadPaymentData({
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [baseCardMethod()],
                  transactionInfo: {
                    totalPriceStatus: "FINAL",
                    totalPrice: amount.toFixed(2),
                    currencyCode: "BRL",
                    countryCode: "BR",
                  },
                  merchantInfo: {
                    merchantName: "Bomgo",
                  },
                })
                .then((paymentData: any) => {
                  const token = paymentData?.paymentMethodData?.tokenizationData?.token
                  if (token) onToken(token)
                  else setError("Não foi possível obter o token do Google Pay.")
                })
                .catch((err: any) => {
                  // User closed the sheet — not a real error.
                  if (err?.statusCode === "CANCELED") return
                  setError("Falha ao processar o Google Pay. Tente novamente ou use outro método.")
                })
            },
          })
          if (containerRef.current) {
            containerRef.current.innerHTML = ""
            containerRef.current.appendChild(button)
          }
          setStatus("ready")
        })
        .catch(() => setStatus("unavailable"))
    }

    if (window.google?.payments?.api) {
      init()
    } else {
      const script = document.createElement("script")
      script.src = "https://pay.google.com/gp/p/js/pay.js"
      script.async = true
      script.onload = init
      script.onerror = () => setStatus("unavailable")
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
    }
  }, [amount, gatewayMerchantId, onToken])

  if (status === "unavailable") {
    return (
      <p className="rounded-md bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
        Google Pay não está disponível neste navegador ou dispositivo.
      </p>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando Google Pay…
        </div>
      )}
      <div ref={containerRef} className={cn_hidden(status !== "ready")} style={{ minHeight: status === "ready" ? 48 : 0 }} />
    </div>
  )
}

function cn_hidden(hidden: boolean) {
  return hidden ? "hidden" : ""
}
