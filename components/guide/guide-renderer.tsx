import type { ContentBlock, ContentDoc } from "@/lib/content/types"
import { slugifyHeading } from "@/lib/content/types"
import {
  ComparisonTable,
  ExpertNote,
  FAQ,
  ProsAndCons,
  SectionHeading,
} from "./primitives"
import { BookingCTA, HotelCard, SofiaCTA } from "./cards"
import { PortoDasDunasMap } from "./porto-das-dunas-map"

// Traduz blocos em componentes.
//
// O `switch` é exaustivo por construção: se um tipo novo entrar em ContentBlock
// e não for tratado aqui, o TypeScript acusa no `never` do default. É o que
// impede um bloco publicado de sumir silenciosamente da página.

function BlockView({
  block,
  doc,
}: {
  block: ContentBlock
  doc: ContentDoc
}) {
  switch (block.type) {
    case "prose":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          {block.paragraphs.map((p, i) => (
            <p key={i} className="text-[17px] leading-relaxed">
              {p}
            </p>
          ))}
        </section>
      )

    case "image":
      return (
        <figure className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagens editoriais vêm de origens variadas */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-xl object-cover"
          />
          {block.caption ? (
            <figcaption className="text-sm text-muted-foreground">
              {block.caption}
              {block.credit ? <span className="ml-1 opacity-70">({block.credit})</span> : null}
            </figcaption>
          ) : null}
        </figure>
      )

    case "gallery":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {block.images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element -- idem
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </section>
      )

    case "video":
      return (
        <figure className="space-y-2">
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src={
                block.provider === "youtube"
                  ? `https://www.youtube-nocookie.com/embed/${block.id}`
                  : `https://player.vimeo.com/video/${block.id}`
              }
              title={block.title}
              loading="lazy"
              allowFullScreen
              className="size-full border-0"
            />
          </div>
          {block.caption ? (
            <figcaption className="text-sm text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      )

    case "map":
      return (
        <section className="space-y-3">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl">
            <iframe
              // `output=embed` não exige chave de API nem carrega SDK — mapa
              // estático custa menos que a biblioteca inteira num guia de leitura.
              src={`https://www.google.com/maps?q=${block.latitude},${block.longitude}&z=${block.zoom ?? 14}&output=embed`}
              title={`Mapa: ${block.label}`}
              loading="lazy"
              className="size-full border-0"
            />
          </div>
        </section>
      )

    case "region-schema":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <PortoDasDunasMap />
        </section>
      )

    case "expert-note":
      return <ExpertNote body={block.body} by={block.by} />

    case "comparison-table":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <ComparisonTable block={block} />
        </section>
      )

    case "pros-and-cons":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <ProsAndCons subject={block.subject} pros={block.pros} cons={block.cons} />
        </section>
      )

    case "hotel-card":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            {block.hotels.map((h) => (
              <HotelCard
                key={h.affiliateKey}
                hotel={h}
                placement="guide-hotel-card"
                destination={doc.destination}
                sourcePath={doc.path}
              />
            ))}
          </div>
        </section>
      )

    case "accommodation-card":
      // A vitrine de imóveis próprios lê o catálogo ao vivo da Stays; enquanto
      // não estiver ligada, o bloco não renderiza nada — em vez de mostrar
      // moldura vazia para o leitor.
      return null

    case "faq":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <FAQ items={block.items} />
        </section>
      )

    case "sofia-answer":
      return (
        <section className="rounded-xl border border-border p-5">
          <p className="font-medium">{block.question}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{block.answer}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Respondido pela Sofia
          </p>
        </section>
      )

    case "itinerary":
      return (
        <section className="space-y-4">
          {block.heading ? <SectionHeading text={block.heading} /> : null}
          <ol className="space-y-4">
            {block.days.map((d) => (
              <li key={d.day} className="rounded-xl border border-border p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                  {d.day}
                </p>
                <p className="mt-1 font-medium">{d.title}</p>
                <ul className="mt-2 space-y-1 text-[15px] text-muted-foreground">
                  {d.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )

    case "cta":
      if (block.variant === "sofia") {
        return (
          <SofiaCTA
            heading={block.heading}
            body={block.body}
            label={block.label}
            placement="guide-cta"
            destination={doc.destination}
            contentSlug={doc.slug}
            sourcePath={doc.path}
          />
        )
      }
      if (block.variant === "booking" && block.target) {
        return (
          <BookingCTA
            affiliateKey={block.target}
            heading={block.heading}
            body={block.body}
            label={block.label}
            placement="guide-cta"
            destination={doc.destination}
            sourcePath={doc.path}
          />
        )
      }
      return null

    default: {
      // Bloco novo sem tratamento vira erro de compilação, não sumiço silencioso.
      const _exhaustive: never = block
      return _exhaustive
    }
  }
}

export function GuideBlocks({ doc }: { doc: ContentDoc }) {
  return (
    <div className="space-y-10">
      {doc.blocks.map((block, i) => (
        <BlockView key={`${block.type}-${i}-${"heading" in block && block.heading ? slugifyHeading(block.heading) : i}`} block={block} doc={doc} />
      ))}
    </div>
  )
}
