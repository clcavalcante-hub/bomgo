import { Suspense } from "react"
import type { Metadata } from "next"
import { SearchResults } from "@/components/search/search-results"

export const metadata: Metadata = {
  title: "Buscar hospedagens | Bomgo",
  description:
    "Encontre apartamentos e casas para temporada com reserva direta em Porto das Dunas, Fortaleza, Beach Park, Jericoacoara e Maragogi.",
}

export default function BuscaPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
          <p className="text-muted-foreground">Carregando hospedagens…</p>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
