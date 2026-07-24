import { motion, useReducedMotion } from 'motion/react'

interface XPBarProps {
  progress: number
}

export function XPBar({ progress }: XPBarProps) {
  const prefersReducedMotion = useReducedMotion()
  const clamped = Math.min(Math.max(progress, 0), 1)

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/8"
      role="presentation"
    >
      <motion.div
        className="h-full rounded-full bg-linear-to-r from-gold/60 to-gold"
        initial={false}
        animate={{ width: `${clamped * 100}%` }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 120, damping: 15, mass: 0.6 }
        }
      />
    </div>
  )
}
