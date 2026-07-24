import { motion, useReducedMotion } from 'motion/react'
import type { DerivedStat, StatKey } from '../../lib/stats'

const STAT_STYLES: Record<StatKey, { text: string; bar: string; track: string }> =
  {
    discipline: { text: 'text-gold', bar: 'bg-gold', track: 'bg-gold/12' },
    vitality: { text: 'text-teal', bar: 'bg-teal', track: 'bg-teal/12' },
    presence: { text: 'text-violet', bar: 'bg-violet', track: 'bg-violet/12' },
    focus: {
      text: 'text-moonlight',
      bar: 'bg-moonlight',
      track: 'bg-moonlight/12',
    },
  }

export function StatCard({ stat }: { stat: DerivedStat }) {
  const prefersReducedMotion = useReducedMotion()
  const styles = STAT_STYLES[stat.key]

  return (
    <article className="rounded-2xl border border-white/8 bg-obsidian/55 px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-moonlight">{stat.label}</h3>
        <p className={`font-mono text-lg font-semibold tabular-nums ${styles.text}`}>
          {stat.value}
        </p>
      </div>

      <div
        className={`mt-2 h-1 w-full overflow-hidden rounded-full ${styles.track}`}
      >
        <motion.div
          className={`h-full rounded-full ${styles.bar}`}
          initial={false}
          animate={{ width: `${stat.fraction * 100}%` }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 120, damping: 16 }
          }
        />
      </div>

      <p className="mt-2 text-[11px] leading-snug text-fog">{stat.detail}</p>
    </article>
  )
}
