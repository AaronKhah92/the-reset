import { Heart, Shield } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { levelFromTotalXP } from '../lib/xp'
import { CurrencyChip } from './ui/CurrencyChip'
import { XPBar } from './ui/XPBar'

export function Header() {
  const totalXP = useAppStore((state) => state.totalXP)
  const discipline = useAppStore((state) => state.currencies.discipline)
  const presence = useAppStore((state) => state.currencies.presence)

  const { level, xpIntoLevel, xpForNextLevel, progress } =
    levelFromTotalXP(totalXP)

  return (
    <header className="sticky top-0 z-10 border-b border-white/6 bg-void/85 px-5 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-full border border-gold/35 bg-gold/8">
          <span className="font-mono text-sm font-semibold leading-none text-gold tabular-nums">
            {level}
          </span>
          <span className="text-[8px] uppercase tracking-[0.14em] text-gold/60">
            lvl
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-base tracking-[0.06em] text-moonlight">
            The Reset
          </h1>
          <p className="font-mono text-[11px] text-fog tabular-nums">
            {xpIntoLevel} / {xpForNextLevel} XP
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <CurrencyChip
            currency="discipline"
            amount={discipline}
            icon={Shield}
            label="Discipline"
          />
          <CurrencyChip
            currency="presence"
            amount={presence}
            icon={Heart}
            label="Presence"
          />
        </div>
      </div>

      <div className="mt-3">
        <XPBar progress={progress} />
      </div>
    </header>
  )
}
