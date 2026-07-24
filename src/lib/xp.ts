export const BASE_LEVEL_COST = 80
export const LEVEL_COST_STEP = 30

export interface LevelProgress {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  progress: number
}

export function xpForLevel(level: number): number {
  return BASE_LEVEL_COST + (level - 1) * LEVEL_COST_STEP
}

export function levelFromTotalXP(totalXP: number): LevelProgress {
  let level = 1
  let remaining = Number.isFinite(totalXP) ? Math.max(0, Math.floor(totalXP)) : 0
  let cost = xpForLevel(level)

  while (remaining >= cost) {
    remaining -= cost
    level += 1
    cost = xpForLevel(level)
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: cost,
    progress: remaining / cost,
  }
}
