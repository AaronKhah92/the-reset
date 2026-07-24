import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const EMBER_COUNT = 14

interface Ember {
  left: number
  size: number
  delay: number
  duration: number
  opacity: number
}

function buildEmbers(): Ember[] {
  const embers: Ember[] = []
  let seed = 20260325

  for (let index = 0; index < EMBER_COUNT; index += 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const a = seed / 2147483648
    seed = (seed * 1103515245 + 12345) % 2147483648
    const b = seed / 2147483648

    embers.push({
      left: a * 100,
      size: 1.5 + b * 2.5,
      delay: a * 12,
      duration: 16 + b * 14,
      opacity: 0.12 + b * 0.18,
    })
  }

  return embers
}

export function AmbientEmbers() {
  const prefersReducedMotion = useReducedMotion()
  const embers = useMemo(buildEmbers, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {embers.map((ember, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${ember.left}%`,
            width: ember.size,
            height: ember.size,
            backgroundColor: 'var(--glow, #E7B155)',
            opacity: ember.opacity,
          }}
          initial={{ bottom: '-5%' }}
          animate={
            prefersReducedMotion ? { bottom: '40%' } : { bottom: ['-5%', '105%'] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: ember.duration,
                  delay: ember.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        />
      ))}
    </div>
  )
}
