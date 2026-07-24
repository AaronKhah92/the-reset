import type { AppState, Rarity } from './types'

export interface Achievement {
  id: string
  name: string
  rarity: Rarity
  title?: string
  isUnlocked: (state: AppState) => boolean
}

export const ACHIEVEMENTS: Achievement[] = []

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)
}

export function unlockedAchievementIds(state: AppState): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.isUnlocked(state)).map(
    (achievement) => achievement.id,
  )
}
