import { Star } from "lucide-react"
import { curatedReviews, reviewsSummary } from "@/lib/data/reviews"
import { StarRating } from "@/components/ui/star-rating"

// Homepage picks a fixed set out of the curated reviews, one per distinct
// guest quote (no repeated text) for variety. Real ratings are kept as-is
// (4/4.5 stars shown as a real partial fill, never rounded up to 5).
const HOME_REVIEW_IDS = [
  "rev-ua02h-isabella",
  "rev-lc03f-gabriel",
  "rev-jn02f-thulio",
  "rev-qh01g-adalberto",
  "rev-kn02j-mariana",
  "rev-ua02h-bruno",
  "rev-xf02h-tatiane",
  "rev-mv01i-celso",
]

export function ReviewsBand() {
  const reviews = HOME_REVIEW_IDS.map((id) => curatedReviews.find((r) => r.id === id)).filter(
    (r): r is (typeof curatedReviews)[number] => Boolean(r),
  )
  if (reviews.length === 0) return null

  const averageLabel = reviewsSummary.average.toFixed(1).replace(".", ",")

  return (
    <section className="border-y border-border bg-secondary/30 py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 font-serif text-3xl font-extrabold text-foreground">
            <Star className="size-7 fill-cta text-cta" /> {averageLabel} de média nas plataformas
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{reviewsSummary.channels.join(" · ")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Avaliações reais de hóspedes verificados · {reviewsSummary.count} avaliações
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col rounded-md border border-border bg-card p-5">
              <StarRating rating={review.rating} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">“{review.quote}”</p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-medium text-foreground">{review.guestName} · Hóspede verificado</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Avaliação verificada no {review.channel} · {review.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
