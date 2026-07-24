import { shiftMonth, stampCount } from './calendar'
import { monthKey } from './date'
import { cumulativeCount } from './streaks'
import type { CurrencyKey, DayCheckins } from './types'

export const BOSS_MINIMUM_REWARD = 20
export const BOSS_REWARD_PER_STAMP = 3

export interface BossRecap {
  month: string
  stamps: number
  checks: number
  reward: Record<CurrencyKey, number>
}

export function bossReward(stamps: number): Record<CurrencyKey, number> {
  const total = Math.max(BOSS_MINIMUM_REWARD, stamps * BOSS_REWARD_PER_STAMP)

  return {
    discipline: Math.ceil(total / 2),
    presence: Math.floor(total / 2),
  }
}

export function buildBossRecap(
  checkins: Record<string, DayCheckins>,
  month: string,
): BossRecap | null {
  const stamps = stampCount(checkins, month)
  if (stamps === 0) return null

  const monthCheckins = Object.fromEntries(
    Object.entries(checkins).filter(([date]) => date.startsWith(month)),
  )

  return {
    month,
    stamps,
    checks: cumulativeCount(monthCheckins, ['window', 'cleanDay', 'kids']),
    reward: bossReward(stamps),
  }
}

export function previousMonth(today: string): string {
  return shiftMonth(monthKey(today), -1)
}
