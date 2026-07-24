import { useEffect } from 'react'
import { ArrowUp, Palette, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAppStore } from '../../store/useAppStore'
import type { Celebration, CelebrationKind } from '../../store/useAppStore'
import type { Rarity } from '../../lib/types'

const TOAST_DURATION_MS = 4500

const KIND_ICONS: Record<CelebrationKind, LucideIcon> = {
  'level-up': ArrowUp,
  achievement: Trophy,
  theme: Palette,
}

const RARITY_ACCENTS: Record<Rarity, string> = {
  common: 'border-fog/30 text-fog',
  rare: 'border-teal/40 text-teal',
  epic: 'border-violet/40 text-violet',
  legendary: 'border-gold/45 text-gold',
}

function accentFor(celebration: Celebration): string {
  if (celebration.rarity) return RARITY_ACCENTS[celebration.rarity]
  if (celebration.kind === 'level-up') return RARITY_ACCENTS.legendary
  return RARITY_ACCENTS.rare
}

function Toast({ celebration }: { celebration: Celebration }) {
  const dismiss = useAppStore((state) => state.dismissCelebration)
  const Icon = KIND_ICONS[celebration.kind]

  useEffect(() => {
    const timer = window.setTimeout(
      () => dismiss(celebration.id),
      TOAST_DURATION_MS,
    )
    return () => window.clearTimeout(timer)
  }, [celebration.id, dismiss])

  return (
    <motion.button
      type="button"
      layout
      onClick={() => dismiss(celebration.id)}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border bg-obsidian/95 px-4 py-3 text-left shadow-lg shadow-black/40 backdrop-blur-sm ${accentFor(
        celebration,
      )}`}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base leading-tight">
          {celebration.title}
        </span>
        <span className="block text-[11px] uppercase tracking-[0.16em] text-fog">
          {celebration.detail}
        </span>
      </span>
    </motion.button>
  )
}

export function CelebrationToasts() {
  const celebrations = useAppStore((state) => state.celebrations)
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-md flex-col gap-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <AnimatePresence initial={false} mode={prefersReducedMotion ? 'wait' : 'sync'}>
        {celebrations.map((celebration) => (
          <Toast key={celebration.id} celebration={celebration} />
        ))}
      </AnimatePresence>
    </div>
  )
}
