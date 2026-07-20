import { Star } from "lucide-react"

/** Renders 1-5 stars honoring fractional ratings (e.g. 4.5) with a real
 * half-fill instead of rounding up to a full star — a 4.5 must never look
 * like a 5. */
export function StarRating({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className={`relative inline-block ${size}`}>
            <Star className={`absolute inset-0 ${size} text-border`} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${size} fill-cta text-cta`} />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
