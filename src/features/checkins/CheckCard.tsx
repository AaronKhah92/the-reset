import { Check } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useAppStore } from '../../store/useAppStore'
import type { CheckAccent, CheckDefinition } from './checkDefinitions'

const ACCENT_STYLES: Record<
  CheckAccent,
  { card: string; iconWrap: string; icon: string; marker: string; streak: string }
> = {
  gold: {
    card: 'border-gold/35 bg-gold/6',
    iconWrap: 'border-gold/30 bg-gold/10',
    icon: 'text-gold',
    marker: 'bg-gold text-void',
    streak: 'text-gold/75',
  },
  violet: {
    card: 'border-violet/35 bg-violet/6',
    iconWrap: 'border-violet/30 bg-violet/10',
    icon: 'text-violet',
    marker: 'bg-violet text-void',
    streak: 'text-violet/75',
  },
}

interface CheckCardProps {
  definition: CheckDefinition
  checked: boolean
  streak: number
  onCheck: () => void
}

export function CheckCard({
  definition,
  checked,
  streak,
  onCheck,
}: CheckCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const gilded = useAppStore((state) =>
    state.purchasedFlourishes.includes('gilded_frame'),
  )
  const accent = ACCENT_STYLES[definition.accent]
  const Icon = definition.icon

  return (
    <motion.button
      type="button"
      onClick={onCheck}
      disabled={checked}
      aria-pressed={checked}
      whileTap={prefersReducedMotion || checked ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors duration-300 ${
        checked
          ? accent.card
          : gilded
            ? 'border-gold/25 bg-obsidian/60 active:border-gold/40'
            : 'border-white/8 bg-obsidian/60 active:border-white/16'
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
          checked ? accent.iconWrap : 'border-white/8 bg-white/3'
        }`}
      >
        <Icon
          className={`size-5 transition-colors duration-300 ${
            checked ? accent.icon : 'text-fog'
          }`}
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[15px] font-semibold leading-tight ${
            checked ? 'text-moonlight' : 'text-moonlight/90'
          }`}
        >
          {definition.label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-fog">
          {definition.description}
        </span>
        {streak > 0 && (
          <span
            className={`mt-1.5 block font-mono text-[11px] tabular-nums ${accent.streak}`}
          >
            {streak} day{streak === 1 ? '' : 's'} running
          </span>
        )}
      </span>

      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
          checked ? `border-transparent ${accent.marker}` : 'border-white/15'
        }`}
      >
        {checked && (
          <motion.span
            initial={prefersReducedMotion ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="flex"
          >
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
          </motion.span>
        )}
      </span>
    </motion.button>
  )
}
