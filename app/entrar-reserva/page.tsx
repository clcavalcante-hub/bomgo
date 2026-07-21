"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ShieldCheck } from "lucide-react"
import { useApp } from "@/components/providers/app-providers"
import { signInWithReservation } from "@/lib/services/auth-service"
import { Logo } from "@/components/brand/logo"

function EntrarReservaForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { login } = useApp()

  const [nome, setNome] = useState(params.get("nome") ?? "")
  const [codigo, setCodigo] = useState(params.get("codigo") ?? "")
  const [checkin, setCheckin] = useState("")
  const [needsCheckin, setNeedsCheckin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nome.trim() || !codigo.trim()) {
      setError("Informe o nome completo e o código da reserva.")
      return
    }
    setLoading(true)
    try {
      const session = await signInWithReservation({ nome, codigo, checkin })
      login(session)
      router.push("/minha-reserva")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível continuar. Tente novamente.")
      setNeedsCheckin(true)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <Logo />
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" /> Acesso da sua reserva
        </span>
        <h1 className="mt-3 text-balance font-serif text-2xl font-medium text-foreground">
          Entrar na sua reserva
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Confirme os dados abaixo pra ver check-in, endereço e horários.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
        <label>
          <span className="mb-1 block text-xs font-medium text-foreground">Nome completo do titular</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como está na reserva"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-foreground">Código da reserva</span>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: 6888884402"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>
        {needsCheckin && (
          <label>
            <span className="mb-1 block text-xs font-medium text-foreground">Data de check-in</span>
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </div>
  )
}

export default function EntrarReservaPage() {
  return (
    <Suspense fallback={null}>
      <EntrarReservaForm />
    </Suspense>
  )
}
