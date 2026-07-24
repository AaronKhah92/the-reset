import { motion, useReducedMotion } from 'motion/react'
import { Sparkles } from 'lucide-react'

export default function App() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        className="flex flex-col items-center gap-5"
      >
        <span className="flex size-14 items-center justify-center rounded-full border border-gold/30 bg-obsidian">
          <Sparkles className="size-6 text-gold" aria-hidden="true" />
        </span>

        <h1 className="font-display text-4xl tracking-[0.08em] text-gold sm:text-5xl">
          The Reset
        </h1>

        <p className="max-w-sm text-balance text-sm leading-relaxed text-fog sm:text-base">
          A small daily practice with a large reaction. Nothing to do here yet.
        </p>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
          Phase 0 · deployment verified
        </p>
      </motion.div>
    </main>
  )
}
