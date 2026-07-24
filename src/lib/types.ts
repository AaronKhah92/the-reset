export type CheckKey = 'window' | 'cleanDay' | 'kids'

export type CurrencyKey = 'discipline' | 'presence'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface DayCheckins {
  window: boolean
  cleanDay: boolean
  kids: boolean
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface CustomQuest {
  name: string | null
  checkins: Record<string, boolean>
}

export interface AppState {
  version: number
  startedAt: string
  totalXP: number
  currencies: Record<CurrencyKey, number>
  checkins: Record<string, DayCheckins>
  weightLog: WeightEntry[]
  customQuest: CustomQuest
  equippedTheme: string
  unlockedThemes: string[]
  equippedTitle: string | null
  purchasedFlourishes: string[]
  monthlyThresholdsGranted: Record<string, number[]>
  lastBossMonthProcessed: string | null
  hasSeenIntro: boolean
}

export const EMPTY_DAY: DayCheckins = {
  window: false,
  cleanDay: false,
  kids: false,
}
