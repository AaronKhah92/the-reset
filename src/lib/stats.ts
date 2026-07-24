import { addDays } from './date'
import { cumulativeCount, fullHouseDates, longestStreak } from './streaks'
import type { DayCheckins } from './types'

export type StatKey = 'discipline' | 'vitality' | 'presence' | 'focus'

export const VITALITY_WINDOW_DAYS = 30

const TIERS: Record<StatKey, number[]> = {
  discipline: [10, 30, 70, 140, 250, 400],
  vitality: [VITALITY_WINDOW_DAYS],
  presence: [10, 30, 70, 140],
  focus: [3, 7, 14, 30, 60, 100],
}

export interface DerivedStat {
  key: StatKey
  label: string
  value: number
  ceiling: number
  fraction: number
  detail: string
}

export function disciplineValue(
  checkins: Record<string, DayCheckins>,
): number {
  return cumulativeCount(checkins, ['window', 'cleanDay'])
}

export function presenceValue(checkins: Record<string, DayCheckins>): number {
  return cumulativeCount(checkins, ['kids'])
}

export function vitalityValue(
  checkins: Record<string, DayCheckins>,
  today: string,
): number {
  let active = 0

  for (let offset = 0; offset < VITALITY_WINDOW_DAYS; offset += 1) {
    const day = checkins[addDays(today, -offset)]
    if (day && (day.window || day.cleanDay || day.kids)) active += 1
  }

  return active
}

export function focusValue(checkins: Record<string, DayCheckins>): number {
  return longestStreak(fullHouseDates(checkins))
}

export function ceilingFor(key: StatKey, value: number): number {
  const tiers = TIERS[key]
  return tiers.find((tier) => value < tier) ?? tiers[tiers.length - 1]
}

export function deriveStats(
  checkins: Record<string, DayCheckins>,
  today: string,
): DerivedStat[] {
  const values: Record<StatKey, number> = {
    discipline: disciplineValue(checkins),
    vitality: vitalityValue(checkins, today),
    presence: presenceValue(checkins),
    focus: focusValue(checkins),
  }

  const details: Record<StatKey, string> = {
    discipline: 'Window and clean-day checks, all time',
    vitality: `Active days in the last ${VITALITY_WINDOW_DAYS}`,
    presence: 'Moments with the kids, all time',
    focus: 'Longest run of all three in a day',
  }

  const labels: Record<StatKey, string> = {
    discipline: 'Discipline',
    vitality: 'Vitality',
    presence: 'Presence',
    focus: 'Focus',
  }

  return (Object.keys(values) as StatKey[]).map((key) => {
    const value = values[key]
    const ceiling = ceilingFor(key, value)

    return {
      key,
      label: labels[key],
      value,
      ceiling,
      fraction: ceiling === 0 ? 0 : Math.min(value / ceiling, 1),
      detail: details[key],
    }
  })
}
