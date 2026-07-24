import { parseISODate } from './date'
import type { DayCheckins } from './types'

export const MONTHLY_STAMP_THRESHOLDS = [5, 15]

export const MONTHLY_STAMP_BONUS: Record<number, number> = {
  5: 5,
  15: 10,
}

export function checksOnDay(day: DayCheckins | undefined): number {
  if (!day) return 0
  return [day.window, day.cleanDay, day.kids].filter(Boolean).length
}

export function isStamped(day: DayCheckins | undefined): boolean {
  return checksOnDay(day) > 0
}

export function stampCount(
  checkins: Record<string, DayCheckins>,
  month: string,
): number {
  return Object.keys(checkins).filter(
    (date) => date.startsWith(month) && isStamped(checkins[date]),
  ).length
}

export function pendingStampBonuses(
  count: number,
  granted: number[],
): number[] {
  return MONTHLY_STAMP_THRESHOLDS.filter(
    (threshold) => count >= threshold && !granted.includes(threshold),
  )
}

export function daysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber, 0).getDate()
}

export function monthGrid(month: string): (string | null)[] {
  const first = parseISODate(`${month}-01`)
  const leading = (first.getDay() + 6) % 7
  const cells: (string | null)[] = Array.from({ length: leading }, () => null)

  for (let day = 1; day <= daysInMonth(month); day += 1) {
    cells.push(`${month}-${String(day).padStart(2, '0')}`)
  }

  return cells
}

export function monthLabel(month: string): string {
  return parseISODate(`${month}-01`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function shiftMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const shifted = new Date(year, monthNumber - 1 + amount, 1)
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`
}
