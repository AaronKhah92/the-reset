import { formatLongDate, todayISO } from '../../lib/date'
import { streakFor } from '../../lib/streaks'
import { EMPTY_DAY } from '../../lib/types'
import { useAppStore } from '../../store/useAppStore'
import { CheckCard } from './CheckCard'
import { CHECK_DEFINITIONS } from './checkDefinitions'

export function DailyCheckins() {
  const checkins = useAppStore((state) => state.checkins)
  const check = useAppStore((state) => state.check)

  const today = todayISO()
  const day = checkins[today] ?? EMPTY_DAY
  const done = CHECK_DEFINITIONS.filter(
    (definition) => day[definition.key],
  ).length

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-lg tracking-[0.05em] text-moonlight">
            Today
          </h2>
          <p className="mt-0.5 text-xs text-fog">{formatLongDate(today)}</p>
        </div>
        <span className="font-mono text-xs text-fog tabular-nums">
          {done} / {CHECK_DEFINITIONS.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {CHECK_DEFINITIONS.map((definition) => (
          <CheckCard
            key={definition.key}
            definition={definition}
            checked={day[definition.key]}
            streak={streakFor(checkins, definition.key, today)}
            onCheck={() => check(definition.key)}
          />
        ))}
      </div>

      <p className="px-1 text-center text-xs leading-relaxed text-fog/70">
        {done === CHECK_DEFINITIONS.length
          ? 'All three today. That is the whole game.'
          : 'Tap what you did. Nothing here keeps score against you.'}
      </p>
    </section>
  )
}
