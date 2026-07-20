import { curatedReviews } from "@/lib/data/reviews"
import { StarRating } from "@/components/ui/star-rating"

export function PropertyReviews({ listingCode }: { listingCode?: string }) {
  if (!listingCode) return null
  const reviews = curatedReviews.filter((r) => r.listingCode === listingCode)
  if (reviews.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl font-medium text-foreground">Avaliações reais de hóspedes</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-md border border-border bg-card p-4">
            <StarRating rating={review.rating} />
            <p className="mt-2.5 text-sm leading-relaxed text-foreground">“{review.quote}”</p>
            <p className="mt-3 text-xs font-medium text-foreground">{review.guestName} · Hóspede verificado</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Avaliação verificada no {review.channel} · {review.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
