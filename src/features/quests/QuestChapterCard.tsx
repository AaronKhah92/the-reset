import { Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ChapterProgress } from '../../lib/quests'

export type QuestAccent = 'teal' | 'violet'

const ACCENTS: Record<
  QuestAccent,
  { eyebrow: string; bar: string; track: string; border: string }
> = {
  teal: {
    eyebrow: 'text-teal',
    bar: 'bg-teal',
    track: 'bg-teal/12',
    border: 'border-teal/20',
  },
  violet: {
    eyebrow: 'text-violet',
    bar: 'bg-violet',
    track: 'bg-violet/12',
    border: 'border-violet/20',
  },
}

interface QuestChapterCardProps {
  eyebrow: string
  accent: QuestAccent
  chapter: ChapterProgress
  lockedUntil?: string
}

export function QuestChapterCard({
  eyebrow,
  accent,
  chapter,
  lockedUntil,
}: QuestChapterCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const styles = ACCENTS[accent]

  if (lockedUntil) {
    return (
      <article className="rounded-2xl border border-white/6 bg-obsidian/40 px-4 py-4">
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.18em] text-fog`}
        >
          {eyebrow}
        </p>
        <div className="mt-2 flex items-center gap-2 text-fog">
          <Lock className="size-4" aria-hidden="true" />
          <p className="text-sm">{lockedUntil}</p>
        </div>
      </article>
    )
  }

  return (
    <article
      className={`rounded-2xl border ${styles.border} bg-obsidian/60 px-4 py-4`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${styles.eyebrow}`}
        >
          {eyebrow}
        </p>
        <p className="font-mono text-[10px] text-fog tabular-nums">
          Ch. {chapter.index + 1}
        </p>
      </div>

      <h3 className="mt-1.5 font-display text-lg leading-tight text-moonlight">
        {chapter.chapter.title}
      </h3>

      <p className="mt-2 text-[13px] leading-relaxed text-fog">
        {chapter.chapter.body}
      </p>

      <div className="mt-4">
        <div
          className={`h-1.5 w-full overflow-hidden rounded-full ${styles.track}`}
        >
          <motion.div
            className={`h-full rounded-full ${styles.bar}`}
            initial={false}
            animate={{ width: `${Math.min(chapter.fraction, 1) * 100}%` }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 120, damping: 16 }
            }
          />
        </div>

        <p className="mt-2 font-mono text-[11px] text-fog tabular-nums">
          {chapter.next
            ? `${chapter.progress} · ${chapter.toNext} to ${chapter.next.title}`
            : `${chapter.progress} · final chapter`}
        </p>
      </div>
    </article>
  )
}
