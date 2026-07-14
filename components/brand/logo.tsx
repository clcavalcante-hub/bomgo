import { cn } from '@/lib/utils'

// Bomgo wordmark. The "o" carries a subtle dot to hint at intelligence,
// keeping the brand tech-forward without any travel-agency connotation.
export function Logo({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'light'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-serif text-2xl font-semibold tracking-tight',
        variant === 'light' ? 'text-primary-foreground' : 'text-primary',
        className,
      )}
    >
      <span>Bomgo</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block size-1.5 translate-y-[-0.15em] rounded-full bg-cta"
      />
    </span>
  )
}
