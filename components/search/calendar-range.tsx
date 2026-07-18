'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatLocalDate, parseLocalDate, startOfLocalDay } from '@/lib/dates'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface CalendarRangeProps {
  checkIn: string | null
  checkOut: string | null
  onChange: (checkIn: string | null, checkOut: string | null) => void
  months?: number
  /** ISO dates (YYYY-MM-DD) that are already booked — shown disabled with a
   * strikethrough, matching Stays' own calendar convention, instead of every
   * future date looking equally selectable regardless of real reservations. */
  blockedDates?: Set<string>
}

export function CalendarRange({
  checkIn,
  checkOut,
  onChange,
  months = 1,
  blockedDates,
}: CalendarRangeProps) {
  const today = startOfLocalDay(new Date())
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const inDate = checkIn ? startOfLocalDay(parseLocalDate(checkIn)) : null
  const outDate = checkOut ? startOfLocalDay(parseLocalDate(checkOut)) : null

  function handleSelect(day: Date) {
    const iso = formatLocalDate(day)
    if (!inDate || (inDate && outDate)) {
      onChange(iso, null)
      return
    }
    if (day.getTime() <= inDate.getTime()) {
      onChange(iso, null)
      return
    }
    onChange(checkIn, iso)
  }

  const grids = useMemo(() => {
    return Array.from({ length: months }).map((_, i) => {
      const base = new Date(cursor.getFullYear(), cursor.getMonth() + i, 1)
      const firstWeekday = base.getDay()
      const daysInMonth = new Date(
        base.getFullYear(),
        base.getMonth() + 1,
        0,
      ).getDate()
      const cells: (Date | null)[] = []
      for (let x = 0; x < firstWeekday; x++) cells.push(null)
      for (let d = 1; d <= daysInMonth; d++)
        cells.push(new Date(base.getFullYear(), base.getMonth(), d))
      return { base, cells }
    })
  }, [cursor, months])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          disabled={
            cursor.getFullYear() === today.getFullYear() &&
            cursor.getMonth() === today.getMonth()
          }
          aria-label="Mês anterior"
          className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex flex-1 justify-around">
          {grids.map((g) => (
            <span
              key={g.base.toISOString()}
              className="text-sm font-semibold text-foreground"
            >
              {MONTHS[g.base.getMonth()]} {g.base.getFullYear()}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          aria-label="Próximo mês"
          className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div
        className={cn(
          'grid gap-4',
          months > 1 ? 'sm:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {grids.map((g) => (
          <div key={g.base.toISOString()}>
            <div className="mb-1 grid grid-cols-7 text-center">
              {WEEKDAYS.map((w, i) => (
                <span
                  key={i}
                  className="py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {g.cells.map((day, idx) => {
                if (!day) return <span key={idx} />
                const time = day.getTime()
                const isPast = time < today.getTime()
                const isBlocked = blockedDates?.has(formatLocalDate(day)) ?? false
                const isDisabled = isPast || isBlocked
                const isStart = inDate && time === inDate.getTime()
                const isEnd = outDate && time === outDate.getTime()
                const inRange =
                  inDate &&
                  outDate &&
                  time > inDate.getTime() &&
                  time < outDate.getTime()
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex justify-center',
                      inRange && 'bg-cta/8',
                      isStart && outDate && 'rounded-l-full bg-cta/8',
                      isEnd && 'rounded-r-full bg-cta/8',
                    )}
                  >
                    <button
                      type="button"
                      disabled={isDisabled}
                      aria-label={isBlocked ? `${day.getDate()} — indisponível` : undefined}
                      onClick={() => handleSelect(day)}
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full text-sm transition-colors',
                        isDisabled && 'cursor-not-allowed text-muted-foreground/40',
                        isBlocked && 'line-through',
                        !isDisabled &&
                          !isStart &&
                          !isEnd &&
                          'text-foreground hover:bg-cta/10',
                        (isStart || isEnd) &&
                          'bg-cta font-semibold text-cta-foreground',
                      )}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
