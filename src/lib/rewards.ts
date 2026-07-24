import type { CheckKey, CurrencyKey } from './types'

export const CHECKIN_BASE_XP = 15
export const STREAK_BONUS_CAP = 10
export const FIRST_CHECK_OF_DAY_XP = 10
export const CURRENCY_PER_CHECKIN = 2

export const CURRENCY_FOR_CHECK: Record<CheckKey, CurrencyKey> = {
  window: 'discipline',
  cleanDay: 'discipline',
  kids: 'presence',
}

export interface CheckinReward {
  xp: number
  currency: CurrencyKey
  currencyAmount: number
}

export function checkinReward(
  key: CheckKey,
  streakAfterCheck: number,
  isFirstCheckOfDay: boolean,
): CheckinReward {
  const streakBonus = Math.min(Math.max(streakAfterCheck, 0), STREAK_BONUS_CAP)
  const firstCheckBonus = isFirstCheckOfDay ? FIRST_CHECK_OF_DAY_XP : 0

  return {
    xp: CHECKIN_BASE_XP + streakBonus + firstCheckBonus,
    currency: CURRENCY_FOR_CHECK[key],
    currencyAmount: CURRENCY_PER_CHECKIN,
  }
}
