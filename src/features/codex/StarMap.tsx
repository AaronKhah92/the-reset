import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ACHIEVEMENTS } from '../../lib/achievements'
import { COLLECTIONS } from '../../lib/collections'
import { RARITY_COLORS } from '../../lib/rarity'
import { STAR_NODES, constellationSegments } from '../../lib/starmap'
import type { Rarity } from '../../lib/types'

const X_SCALE = 0.8
const BEACON = { x: 40, y: 97 }

function rarityLookup(): Record<string, Rarity> {
  const lookup: Record<string, Rarity> = {}
  for (const achievement of ACHIEVEMENTS) lookup[achievement.id] = achievement.rarity
  for (const collection of COLLECTIONS) lookup[collection.id] = collection.rarity
  return lookup
}

function deepFieldStars(count: number) {
  const stars: { x: number; y: number; r: number; opacity: number }[] = []
  let seed = 20260325

  for (let index = 0; index < count; index += 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const x = (seed / 2147483648) * 80
    seed = (seed * 1103515245 + 12345) % 2147483648
    const y = (seed / 2147483648) * 92
    seed = (seed * 1103515245 + 12345) % 2147483648
    const jitter = seed / 2147483648

    stars.push({ x, y, r: 0.16 + jitter * 0.26, opacity: 0.18 + jitter * 0.4 })
  }

  return stars
}

interface StarMapProps {
  unlockedIds: Set<string>
  selectedId: string | null
  onSelect: (id: string) => void
  level: number
  deepField: boolean
}

export function StarMap({
  unlockedIds,
  selectedId,
  onSelect,
  level,
  deepField,
}: StarMapProps) {
  const prefersReducedMotion = useReducedMotion()
  const rarities = useMemo(rarityLookup, [])
  const segments = useMemo(constellationSegments, [])
  const distant = useMemo(() => (deepField ? deepFieldStars(46) : []), [deepField])

  const beaconRadius = 2 + Math.min(level, 30) * 0.12

  return (
    <svg
      viewBox="0 0 80 100"
      className="w-full touch-manipulation"
      role="img"
      aria-label="Your constellation of achievements and collections"
    >
      <defs>
        <radialGradient id="beacon-glow">
          <stop offset="0%" stopColor="var(--glow, #E7B155)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--glow, #E7B155)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {distant.map((star, index) => (
        <circle
          key={`distant-${index}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#EDEAF6"
          opacity={star.opacity}
        />
      ))}

      {segments.map(({ from, to }) => {
        const lit = unlockedIds.has(from.id) && unlockedIds.has(to.id)

        return (
          <line
            key={`${from.id}-${to.id}`}
            x1={from.x * X_SCALE}
            y1={from.y}
            x2={to.x * X_SCALE}
            y2={to.y}
            stroke={lit ? RARITY_COLORS[rarities[from.id]] : '#8D8FB0'}
            strokeWidth={lit ? 0.28 : 0.16}
            opacity={lit ? 0.4 : 0.12}
          />
        )
      })}

      <circle
        cx={BEACON.x}
        cy={BEACON.y}
        r={beaconRadius * 4}
        fill="url(#beacon-glow)"
      />
      <circle
        cx={BEACON.x}
        cy={BEACON.y}
        r={beaconRadius}
        fill="var(--glow, #E7B155)"
        opacity={0.9}
      />

      {STAR_NODES.map((node) => {
        const unlocked = unlockedIds.has(node.id)
        const color = RARITY_COLORS[rarities[node.id]]
        const isSelected = node.id === selectedId
        const cx = node.x * X_SCALE
        const legendary = rarities[node.id] === 'legendary'

        return (
          <g key={node.id}>
            {unlocked && (
              <motion.circle
                cx={cx}
                cy={node.y}
                r={3.2}
                fill={color}
                initial={false}
                animate={
                  legendary && !prefersReducedMotion
                    ? { opacity: [0.16, 0.34, 0.16] }
                    : { opacity: 0.18 }
                }
                transition={
                  legendary && !prefersReducedMotion
                    ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0 }
                }
              />
            )}

            <circle
              cx={cx}
              cy={node.y}
              r={unlocked ? 1.45 : 1.3}
              fill={unlocked ? color : 'none'}
              stroke={unlocked ? 'none' : '#8D8FB0'}
              strokeWidth={0.32}
              opacity={unlocked ? 1 : 0.4}
              style={
                unlocked ? { filter: `drop-shadow(0 0 1.6px ${color})` } : undefined
              }
            />

            {isSelected && (
              <circle
                cx={cx}
                cy={node.y}
                r={4.2}
                fill="none"
                stroke={color}
                strokeWidth={0.3}
                opacity={0.8}
              />
            )}

            <circle
              cx={cx}
              cy={node.y}
              r={5}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onSelect(node.id)}
            />
          </g>
        )
      })}
    </svg>
  )
}
