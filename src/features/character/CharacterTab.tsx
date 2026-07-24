import { daysBetween, todayISO } from '../../lib/date'
import { deriveStats } from '../../lib/stats'
import { levelFromTotalXP } from '../../lib/xp'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from './StatCard'
import { WeightField } from './WeightField'

export function CharacterTab() {
  const checkins = useAppStore((state) => state.checkins)
  const totalXP = useAppStore((state) => state.totalXP)
  const startedAt = useAppStore((state) => state.startedAt)
  const equippedTitle = useAppStore((state) => state.equippedTitle)

  const today = todayISO()
  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXP(totalXP)
  const stats = deriveStats(checkins, today)
  const dayNumber = daysBetween(startedAt, today) + 1

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-gold/20 bg-obsidian/60 px-4 py-5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
          Level
        </p>
        <p className="mt-1 font-display text-4xl leading-none text-gold tabular-nums">
          {level}
        </p>
        <p className="mt-2 text-sm text-moonlight">
          {equippedTitle ?? 'No title equipped'}
        </p>
        <p className="mt-3 font-mono text-[11px] text-fog tabular-nums">
          {xpIntoLevel} / {xpForNextLevel} XP · day {dayNumber}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>

      <WeightField />
    </section>
  )
}
