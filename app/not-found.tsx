import Link from "next/link"
import { Compass, Search } from "lucide-react"

export const metadata = {
  title: "Página não encontrada — Bomgo",
}

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 pt-24 text-center md:pt-28">
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary/70 text-primary">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-medium text-foreground">Página não encontrada</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        O endereço que você acessou não existe ou a hospedagem que você procurava não está mais disponível.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Voltar para a página inicial
        </Link>
        <Link
          href="/busca"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
        >
          <Search className="size-4" /> Buscar hospedagens
        </Link>
      </div>
    </div>
  )
}
