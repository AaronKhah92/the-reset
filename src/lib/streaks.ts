import { addDays } from './date'
import type { CheckKey, DayCheckins } from './types'

export function datesWithCheck(
  checkins: Record<string, DayCheckins>,
  key: CheckKey,
): string[] {
  return Object.keys(checkins)
    .filter((date) => checkins[date]?.[key])
    .sort()
}

export function currentStreak(dates: Iterable<string>, today: string): number {
  const marked = new Set(dates)
  let cursor = marked.has(today) ? today : addDays(today, -1)
  let streak = 0

  while (marked.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export function streakFor(
  checkins: Record<string, DayCheckins>,
  key: CheckKey,
  today: string,
): number {
  return currentStreak(datesWithCheck(checkins, key), today)
}

export function cumulativeCount(
  checkins: Record<string, DayCheckins>,
  keys: CheckKey[],
): number {
  return Object.values(checkins).reduce(
    (total, day) => total + keys.filter((key) => day[key]).length,
    0,
  )
}
