import { cn } from '@/lib/utils'

type Tone = 'brand' | 'gold' | 'cta' | 'neutral' | 'success'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-primary text-primary-foreground',
  gold: 'bg-gold text-gold-foreground',
  cta: 'bg-cta/12 text-cta',
  neutral: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/12 text-success',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none tracking-tight',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
