import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { achievementById, unlockedAchievementIds } from '../lib/achievements'
import { todayISO } from '../lib/date'
import { checkinReward } from '../lib/rewards'
import { streakFor } from '../lib/streaks'
import { levelFromTotalXP } from '../lib/xp'
import { EMPTY_DAY } from '../lib/types'
import type { AppState, CheckKey, Rarity } from '../lib/types'

export const STATE_VERSION = 1
const STORAGE_KEY = 'the-reset'

const memoryEntries = new Map<string, string>()

const memoryStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: (key) => memoryEntries.get(key) ?? null,
  setItem: (key, value) => {
    memoryEntries.set(key, value)
  },
  removeItem: (key) => {
    memoryEntries.delete(key)
  },
}

function resolveStorage() {
  try {
    const probe = `${STORAGE_KEY}:probe`
    globalThis.localStorage.setItem(probe, '1')
    globalThis.localStorage.removeItem(probe)
    return globalThis.localStorage
  } catch {
    return memoryStorage
  }
}

export type CelebrationKind = 'level-up' | 'achievement' | 'theme'

export interface Celebration {
  id: string
  kind: CelebrationKind
  title: string
  detail: string
  rarity?: Rarity
}

interface AppActions {
  check: (key: CheckKey, date?: string) => void
  dismissCelebration: (id: string) => void
}

export type AppStore = AppState & { celebrations: Celebration[] } & AppActions

interface RewardSnapshot {
  level: number
  achievements: string[]
  themes: string[]
}

function createInitialState(): AppState {
  return {
    version: STATE_VERSION,
    startedAt: todayISO(),
    totalXP: 0,
    currencies: { discipline: 0, presence: 0 },
    checkins: {},
    weightLog: [],
    customQuest: { name: null, checkins: {} },
    equippedTheme: 'default',
    unlockedThemes: ['default'],
    equippedTitle: null,
    purchasedFlourishes: [],
    monthlyThresholdsGranted: {},
    lastBossMonthProcessed: null,
    hasSeenIntro: false,
  }
}

function snapshot(state: AppState): RewardSnapshot {
  return {
    level: levelFromTotalXP(state.totalXP).level,
    achievements: unlockedAchievementIds(state),
    themes: state.unlockedThemes,
  }
}

function celebrationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function diffCelebrations(
  before: RewardSnapshot,
  after: RewardSnapshot,
): Celebration[] {
  const queued: Celebration[] = []

  if (after.level > before.level) {
    queued.push({
      id: celebrationId(),
      kind: 'level-up',
      title: `Level ${after.level}`,
      detail: 'Character level up',
    })
  }

  for (const id of after.achievements) {
    if (before.achievements.includes(id)) continue
    const achievement = achievementById(id)
    queued.push({
      id: celebrationId(),
      kind: 'achievement',
      title: achievement?.name ?? id,
      detail: 'Achievement unlocked',
      rarity: achievement?.rarity,
    })
  }

  for (const theme of after.themes) {
    if (before.themes.includes(theme)) continue
    queued.push({
      id: celebrationId(),
      kind: 'theme',
      title: theme,
      detail: 'Theme unlocked',
    })
  }

  return queued
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      const withRewards = (
        mutate: (state: AppStore) => Partial<AppState> | null,
      ) => {
        const current = get()
        const patch = mutate(current)
        if (!patch) return

        const next = { ...current, ...patch }
        const queued = diffCelebrations(snapshot(current), snapshot(next))

        set({
          ...patch,
          celebrations: [...current.celebrations, ...queued],
        })
      }

      return {
        ...createInitialState(),
        celebrations: [],

        check: (key, date = todayISO()) =>
          withRewards((state) => {
            const day = state.checkins[date] ?? EMPTY_DAY
            if (day[key]) return null

            const isFirstCheckOfDay = !day.window && !day.cleanDay && !day.kids
            const checkins = {
              ...state.checkins,
              [date]: { ...day, [key]: true },
            }
            const reward = checkinReward(
              key,
              streakFor(checkins, key, date),
              isFirstCheckOfDay,
            )

            return {
              checkins,
              totalXP: state.totalXP + reward.xp,
              currencies: {
                discipline:
                  state.currencies.discipline +
                  (reward.currency === 'discipline' ? reward.currencyAmount : 0),
                presence:
                  state.currencies.presence +
                  (reward.currency === 'presence' ? reward.currencyAmount : 0),
              },
            }
          }),

        dismissCelebration: (id) =>
          set((state) => ({
            celebrations: state.celebrations.filter(
              (celebration) => celebration.id !== id,
            ),
          })),
      }
    },
    {
      name: STORAGE_KEY,
      version: STATE_VERSION,
      storage: createJSONStorage(resolveStorage),
      partialize: (state): AppState => ({
        version: state.version,
        startedAt: state.startedAt,
        totalXP: state.totalXP,
        currencies: state.currencies,
        checkins: state.checkins,
        weightLog: state.weightLog,
        customQuest: state.customQuest,
        equippedTheme: state.equippedTheme,
        unlockedThemes: state.unlockedThemes,
        equippedTitle: state.equippedTitle,
        purchasedFlourishes: state.purchasedFlourishes,
        monthlyThresholdsGranted: state.monthlyThresholdsGranted,
        lastBossMonthProcessed: state.lastBossMonthProcessed,
        hasSeenIntro: state.hasSeenIntro,
      }),
    },
  ),
)
