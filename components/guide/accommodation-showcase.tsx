import Image from "next/image"
import Link from "next/link"
import { getFeaturedProperties } from "@/lib/data/live-properties"

/**
 * Vitrine de imóveis próprios dentro do conteúdo editorial.
 *
 * Diferente do card de parceiro em dois pontos que importam comercialmente:
 * aqui há preço, porque é nosso e sabemos dele; e o destino é a reserva direta,
 * sem intermediário nem comissão. O selo diz isso ao leitor, que precisa
 * entender a diferença antes de clicar.
 *
 * Os dados vêm ao vivo da Stays a cada revalidação — nunca copiados para o
 * arquivo do guia, que envelheceria em silêncio enquanto o preço muda.
 *
 * Se a Stays estiver fora do ar, a seção inteira desaparece em vez de mostrar
 * moldura vazia: uma opção a menos é melhor que um card quebrado numa página
 * que promete curadoria.
 */
export async function AccommodationShowcase({
  heading,
  limit = 3,
}: {
  heading?: string
  limit?: number
}) {
  let properties = []
  try {
    properties = await getFeaturedProperties(limit)
  } catch {
    return null
  }
  if (!properties.length) return null

  const brl = (n: number) =>
    Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

  return (
    <section className="space-y-4">
      {heading ? <h2 className="text-balance text-2xl font-semibold">{heading}</h2> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <Link
            key={p.slug}
            href={`/imovel/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/50"
          >
            {p.images?.[0]?.src ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={p.images[0].src}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            ) : null}

            <div className="flex flex-1 flex-col gap-2 p-4">
              <span className="self-start rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                Reserva direta Bomgo
              </span>
              <span className="line-clamp-2 font-semibold leading-snug">{p.name}</span>
              <span className="text-sm text-muted-foreground">
                {p.bedrooms > 0 ? `${p.bedrooms} quarto${p.bedrooms > 1 ? "s" : ""}` : null}
                {p.bedrooms > 0 && p.maxGuests > 0 ? " · " : null}
                {p.maxGuests > 0 ? `até ${p.maxGuests} hóspedes` : null}
              </span>
              {p.nightlyPrice > 0 ? (
                <span className="mt-auto pt-2 text-sm">
                  <strong className="text-base">{brl(p.nightlyPrice)}</strong>
                  <span className="text-muted-foreground"> /noite</span>
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Apartamentos administrados pela Bomgo — reserva direta, sem taxa de plataforma.
      </p>
    </section>
  )
}
