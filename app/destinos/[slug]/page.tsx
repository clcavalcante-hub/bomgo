import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { docBySlug, relatedDocs } from "@/lib/content/registry"
import {
  AffiliateDisclosure,
  AuthorBox,
  GuideHero,
  RelatedGuides,
  SourceList,
  TableOfContents,
} from "@/components/guide/primitives"
import { GuideBlocks } from "@/components/guide/guide-renderer"

/**
 * Em homologação (preview da Vercel) o conteúdo ainda em validação é visível,
 * para o Christiano revisar antes de aprovar. Em produção, nunca: guia com
 * lacuna marcada não vai ao ar, e o `notFound()` garante 404 de verdade em vez
 * de página fina indexável.
 */
const SHOW_UNPUBLISHED = process.env.VERCEL_ENV !== "production"

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = docBySlug(slug, SHOW_UNPUBLISHED)
  if (!doc) return { title: "Guia não encontrado" }

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: doc.path },
    // Conteúdo pendente não deve ser indexado nem quando visível no preview.
    robots: doc.status === "published" ? undefined : { index: false, follow: false },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: doc.path,
      type: "article",
      locale: "pt_BR",
      publishedTime: doc.publishedAt,
      modifiedTime: doc.updatedAt,
      images: doc.cover ? [{ url: doc.cover.src }] : undefined,
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = docBySlug(slug, SHOW_UNPUBLISHED)
  if (!doc) notFound()

  const related = relatedDocs(doc).map((d) => ({
    path: d.path,
    title: d.title,
    description: d.subtitle,
  }))

  return (
    <article className="pb-20">
      <GuideHero doc={doc} />

      <div className="mx-auto mt-8 w-full max-w-3xl space-y-8 px-4 md:px-6">
        {doc.status !== "published" ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Pré-visualização.</strong> Este guia está em validação — os trechos marcados
            como <code>[PENDENTE]</code> aguardam informação confirmada e não vão ao ar assim.
          </p>
        ) : null}

        {doc.hasAffiliateLinks ? <AffiliateDisclosure /> : null}

        <TableOfContents doc={doc} />

        <GuideBlocks doc={doc} />

        <AuthorBox author={doc.author} reviewer={doc.reviewer} />

        {doc.sources?.length ? <SourceList sources={doc.sources} /> : null}

        <RelatedGuides items={related} />
      </div>
    </article>
  )
}
