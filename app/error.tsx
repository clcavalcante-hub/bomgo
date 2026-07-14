"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RotateCcw, TriangleAlert } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[bomgo] unhandled error boundary:", error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 pt-24 text-center md:pt-28">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-medium text-foreground">Algo deu errado</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Não conseguimos carregar esta página agora. Você pode tentar de novo ou voltar para a página inicial.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <RotateCcw className="size-4" /> Tentar de novo
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
        >
          Página inicial
        </Link>
      </div>
    </div>
  )
}
