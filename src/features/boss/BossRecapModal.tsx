import { Heart, Shield } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { monthLabel } from '../../lib/calendar'
import { useAppStore } from '../../store/useAppStore'

export function BossRecapModal() {
  const recap = useAppStore((state) => state.bossRecap)
  const dismiss = useAppStore((state) => state.dismissBossRecap)
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {recap && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-void/80 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Monthly Reckoning"
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl border border-gold/25 bg-obsidian px-5 py-6 text-center"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Monthly Reckoning
            </p>

            <h2 className="mt-2 font-display text-2xl leading-tight text-moonlight">
              {monthLabel(recap.month)}
            </h2>

            <div className="mt-5 flex items-stretch justify-center gap-3">
              <div className="flex-1 rounded-2xl border border-white/8 bg-void/50 px-3 py-3">
                <p className="font-mono text-2xl text-gold tabular-nums">
                  {recap.stamps}
                </p>
                <p className="mt-0.5 text-[11px] text-fog">days stamped</p>
              </div>
              <div className="flex-1 rounded-2xl border border-white/8 bg-void/50 px-3 py-3">
                <p className="font-mono text-2xl text-teal tabular-nums">
                  {recap.checks}
                </p>
                <p className="mt-0.5 text-[11px] text-fog">checks made</p>
              </div>
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-fog">
              That month is banked. Nothing carries over as debt.
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-gold/25 px-3 py-1.5 text-gold">
                <Shield className="size-3.5" aria-hidden="true" />
                <span className="font-mono text-xs tabular-nums">
                  +{recap.reward.discipline}
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-violet/25 px-3 py-1.5 text-violet">
                <Heart className="size-3.5" aria-hidden="true" />
                <span className="font-mono text-xs tabular-nums">
                  +{recap.reward.presence}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-xl border border-white/12 bg-white/4 py-3 text-sm font-medium text-moonlight"
            >
              Onward
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
