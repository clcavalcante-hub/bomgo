import { Suspense } from "react"
import { SearchResults } from "@/components/search/search-results"

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <SearchResults />
    </Suspense>
  )
}
