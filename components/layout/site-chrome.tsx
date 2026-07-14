import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SearchModal } from "@/components/search/search-modal"
import { SofiaConcierge } from "@/components/sofia/sofia-concierge"

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SearchModal />
      <SofiaConcierge />
    </div>
  )
}
