import { daysInMonth, stampCount } from './calendar'
import { cumulativeCount } from './streaks'
import type { DayCheckins, Rarity } from './types'

export interface Collection {
  id: string
  name: string
  description: string
  rarity: Rarity
  target: number
  themeId: string
  progress: (checkins: Record<string, DayCheckins>) => number
}

export function monthsFullyStamped(
  checkins: Record<string, DayCheckins>,
): string[] {
  const months = new Set(Object.keys(checkins).map((date) => date.slice(0, 7)))

  return Array.from(months)
    .filter((month) => stampCount(checkins, month) === daysInMonth(month))
    .sort()
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'evening_calm',
    name: 'Evening Calm',
    description: 'Seven clean days',
    rarity: 'rare',
    target: 7,
    themeId: 'frost',
    progress: (checkins) => cumulativeCount(checkins, ['cleanDay']),
  },
  {
    id: 'morning_light',
    name: 'Morning Light',
    description: 'Seven days inside the window',
    rarity: 'rare',
    target: 7,
    themeId: 'verdant',
    progress: (checkins) => cumulativeCount(checkins, ['window']),
  },
  {
    id: 'family_time',
    name: 'Family Time',
    description: 'Ten days present with the kids',
    rarity: 'rare',
    target: 10,
    themeId: 'twilight',
    progress: (checkins) => cumulativeCount(checkins, ['kids']),
  },
  {
    id: 'full_moon',
    name: 'Full Moon',
    description: 'Every day of one calendar month stamped',
    rarity: 'legendary',
    target: 1,
    themeId: 'aurora',
    progress: (checkins) => monthsFullyStamped(checkins).length,
  },
]

export function collectionById(id: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.id === id)
}

export function collectionProgress(
  collection: Collection,
  checkins: Record<string, DayCheckins>,
): { value: number; complete: boolean; fraction: number } {
  const value = collection.progress(checkins)

  return {
    value,
    complete: value >= collection.target,
    fraction: Math.min(value / collection.target, 1),
  }
}

export function completedCollections(
  checkins: Record<string, DayCheckins>,
): Collection[] {
  return COLLECTIONS.filter(
    (collection) => collection.progress(checkins) >= collection.target,
  )
}

export function earnedThemeIds(
  checkins: Record<string, DayCheckins>,
): string[] {
  return completedCollections(checkins).map((collection) => collection.themeId)
}
