import Link from "next/link"
import { CalendarCheck, Info, ListChecks, Minus, Plus, Quote } from "lucide-react"
import type { Byline, ComparisonTableBlock, ContentDoc } from "@/lib/content/types"
import { slugifyHeading, tableOfContents } from "@/lib/content/types"
import { AFFILIATE_DISCLOSURE } from "@/lib/affiliates"

// Peças de leitura dos guias.
//
// Tudo aqui é servidor: são blocos de texto, sem estado. O que precisa de clique
// (CTA de parceiro, CTA da Sofia) vive em cards.tsx, que é cliente — assim o
// JavaScript enviado ao celular fica só no que realmente interage.

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? iso : dateFormatter.format(d)
}

export function GuideHero({ doc }: { doc: ContentDoc }) {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 pt-10 md:px-6 md:pt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {doc.category === "comparativo" ? "Comparativo" : "Guia"} · {doc.destination.replace(/-/g, " ")}
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight md:text-4xl">
        {doc.heading}
      </h1>
      {doc.subtitle ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{doc.subtitle}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>Por {doc.author.name}</span>
        <span aria-hidden="true">·</span>
        <span>{doc.readingMinutes} min de leitura</span>
        <span aria-hidden="true">·</span>
        <LastUpdated iso={doc.updatedAt} />
      </div>
    </header>
  )
}

/**
 * Data de atualização. Sai como <time> com `dateTime` legível por máquina — o
 * Google usa isso para decidir se um guia ainda vale, e conteúdo de viagem
 * envelhece rápido.
 */
export function LastUpdated({ iso }: { iso: string }) {
  return (
    <time dateTime={iso}>Atualizado em {formatDate(iso)}</time>
  )
}

export function GuideSummary({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5 md:p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Resumo
      </p>
      <div className="space-y-2 text-[15px] leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

/** Sumário navegável, montado a partir dos títulos dos blocos. */
export function TableOfContents({ doc }: { doc: ContentDoc }) {
  const items = tableOfContents(doc)
  if (items.length < 3) return null // com poucas seções, o índice só atrapalha

  return (
    <nav aria-label="Neste guia" className="rounded-xl border border-border p-5">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <ListChecks className="size-4" aria-hidden="true" />
        Neste guia
      </p>
      <ol className="space-y-2 text-[15px]">
        {items.map((item) => (
          <li key={item.id}>
            <a className="text-primary underline-offset-4 hover:underline" href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Nota de quem conhece a região — o diferencial editorial contra a OTA. */
export function ExpertNote({ body, by }: { body: string; by?: string }) {
  return (
    <aside className="rounded-xl border-l-4 border-l-primary border-y border-r border-border bg-primary/[0.04] p-5">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
        <Quote className="size-4" aria-hidden="true" />
        Quem conhece a região
      </p>
      <p className="text-[15px] leading-relaxed">{body}</p>
      {by ? <p className="mt-2 text-sm text-muted-foreground">— {by}</p> : null}
    </aside>
  )
}

export function ProsAndCons({
  subject,
  pros,
  cons,
}: {
  subject: string
  pros: string[]
  cons: string[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-border p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <Plus className="size-4" aria-hidden="true" />
          A favor · {subject}
        </p>
        <ul className="space-y-2 text-[15px]">
          {pros.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="text-emerald-600">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          <Minus className="size-4" aria-hidden="true" />
          A considerar
        </p>
        <ul className="space-y-2 text-[15px]">
          {cons.map((c, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="text-amber-600">•</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Tabela comparativa. Rola no próprio contêiner: numa tela de celular a tabela
 * é o único elemento que pode passar da largura, e a página nunca deve rolar
 * para o lado por causa dela.
 */
export function ComparisonTable({ block }: { block: ComparisonTableBlock }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="bg-muted/50">
              <th scope="col" className="p-3 text-left font-semibold" />
              {block.columns.map((c) => (
                <th key={c} scope="col" className="p-3 text-left font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                  {row.label}
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className="p-3">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.sourceNote ? (
        <p className="mt-2 text-xs text-muted-foreground">{block.sourceNote}</p>
      ) : null}
    </div>
  )
}

export function FAQ({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <details key={item.question} className="group p-5">
          <summary className="cursor-pointer list-none font-medium marker:content-none">
            <span className="flex items-start justify-between gap-4">
              {item.question}
              <Plus
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                aria-hidden="true"
              />
            </span>
          </summary>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function AuthorBox({ author, reviewer }: { author: Byline; reviewer?: Byline }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <p className="font-medium">Escrito por {author.name}</p>
      <p className="text-sm text-muted-foreground">{author.role}</p>
      {author.credential ? (
        <p className="mt-2 text-[15px] leading-relaxed">{author.credential}</p>
      ) : null}
      {reviewer ? (
        <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
          Revisado por {reviewer.name} — {reviewer.role}
        </p>
      ) : null}
    </div>
  )
}

export function SourceList({ sources }: { sources: { label: string; url?: string }[] }) {
  if (!sources.length) return null
  return (
    <div className="rounded-xl border border-border p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Fontes consultadas
      </p>
      <ul className="space-y-1 text-sm">
        {sources.map((s) => (
          <li key={s.label}>
            {s.url ? (
              <a
                href={s.url}
                rel="noopener nofollow"
                target="_blank"
                className="text-primary underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
            ) : (
              s.label
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Aviso de comissão.
 *
 * Fica no topo do conteúdo que tem link de parceiro, não escondido no rodapé:
 * é exigência do programa de afiliados e do bom senso — quem lê precisa saber
 * antes de clicar, não depois.
 */
export function AffiliateDisclosure() {
  return (
    <p className="flex gap-2 rounded-lg bg-muted/50 p-3 text-[13px] leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{AFFILIATE_DISCLOSURE}</span>
    </p>
  )
}

export function RelatedGuides({
  items,
}: {
  items: { path: string; title: string; description?: string }[]
}) {
  if (!items.length) return null
  return (
    <section aria-labelledby="relacionados">
      <h2 id="relacionados" className="mb-4 text-xl font-semibold">
        Continue lendo
      </h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className="block h-full rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <span className="flex items-center gap-2 font-medium">
                <CalendarCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {item.title}
              </span>
              {item.description ? (
                <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Âncora de seção, para o sumário navegável apontar. */
export function SectionHeading({ text }: { text: string }) {
  return (
    <h2 id={slugifyHeading(text)} className="scroll-mt-24 text-balance text-2xl font-semibold">
      {text}
    </h2>
  )
}
