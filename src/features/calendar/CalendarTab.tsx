import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  MONTHLY_STAMP_THRESHOLDS,
  checksOnDay,
  monthGrid,
  monthLabel,
  shiftMonth,
  stampCount,
} from '../../lib/calendar'
import { monthKey, todayISO } from '../../lib/date'
import { useAppStore } from '../../store/useAppStore'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const CELL_STYLES = [
  'border-white/6 bg-white/2 text-fog/45',
  'border-gold/20 bg-gold/10 text-gold/70',
  'border-gold/30 bg-gold/20 text-gold/85',
  'border-gold/45 bg-gold/32 text-gold',
]

export function CalendarTab() {
  const checkins = useAppStore((state) => state.checkins)
  const granted = useAppStore((state) => state.monthlyThresholdsGranted)

  const today = todayISO()
  const thisMonth = monthKey(today)
  const [month, setMonth] = useState(thisMonth)

  const cells = monthGrid(month)
  const stamps = stampCount(checkins, month)
  const grantedHere = granted[month] ?? []

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-lg border border-white/8 text-fog"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        <h2 className="font-display text-lg tracking-[0.05em] text-moonlight">
          {monthLabel(month)}
        </h2>

        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={month >= thisMonth}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-lg border border-white/8 text-fog disabled:opacity-30"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1.5 pb-1.5">
          {WEEKDAYS.map((weekday, index) => (
            <span
              key={`${weekday}-${index}`}
              className="text-center font-mono text-[10px] uppercase text-fog/50"
            >
              {weekday}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, index) => {
            if (!date) return <span key={`pad-${index}`} />

            const count = checksOnDay(checkins[date])
            const isToday = date === today

            return (
              <span
                key={date}
                title={`${date} · ${count} of 3`}
                className={`flex aspect-square items-center justify-center rounded-lg border font-mono text-[11px] tabular-nums ${
                  CELL_STYLES[count]
                } ${isToday ? 'ring-1 ring-teal/70' : ''}`}
              >
                {Number(date.slice(-2))}
              </span>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-obsidian/50 px-4 py-4">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
            Days stamped
          </p>
          <p className="font-mono text-sm text-gold tabular-nums">{stamps}</p>
        </div>

        <ul className="mt-3 flex flex-col gap-1.5">
          {MONTHLY_STAMP_THRESHOLDS.map((threshold) => {
            const reached = grantedHere.includes(threshold)
            return (
              <li
                key={threshold}
                className={`flex items-center justify-between text-xs ${
                  reached ? 'text-gold' : 'text-fog'
                }`}
              >
                <span>{threshold} day bonus</span>
                <span className="font-mono tabular-nums">
                  {reached ? 'collected' : `${Math.max(threshold - stamps, 0)} to go`}
                </span>
              </li>
            )
          })}
        </ul>

        <p className="mt-3 text-[11px] leading-relaxed text-fog/70">
          Stamps are cumulative, not consecutive. A blank day costs nothing.
        </p>
      </div>
    </section>
  )
}
