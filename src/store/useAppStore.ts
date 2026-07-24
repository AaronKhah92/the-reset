import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  achievementById,
  unlockedAchievementIds,
  unlockedTitles,
} from '../lib/achievements'
import { buildBossRecap, previousMonth } from '../lib/boss'
import type { BossRecap } from '../lib/boss'
import { earnedThemeIds } from '../lib/collections'
import { canAfford, flourishById } from '../lib/flourishes'
import { themeById } from '../lib/themes'
import {
  MONTHLY_STAMP_BONUS,
  pendingStampBonuses,
  stampCount,
} from '../lib/calendar'
import { monthKey, todayISO } from '../lib/date'
import {
  CHECKIN_BASE_XP,
  STREAK_BONUS_CAP,
  checkinReward,
} from '../lib/rewards'
import { currentStreak, streakFor } from '../lib/streaks'
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

export type CelebrationKind = 'level-up' | 'achievement' | 'theme' | 'bonus'

export interface Celebration {
  id: string
  kind: CelebrationKind
  title: string
  detail: string
  rarity?: Rarity
}

interface AppActions {
  check: (key: CheckKey, date?: string) => void
  nameCustomQuest: (name: string) => void
  checkCustomQuest: (date?: string) => void
  logWeight: (weight: number, date?: string) => void
  equipTheme: (themeId: string) => void
  equipTitle: (title: string | null) => void
  purchaseFlourish: (id: string) => void
  processMonthlyBoss: (today?: string) => void
  dismissBossRecap: () => void
  dismissCelebration: (id: string) => void
}

interface RewardedMutation {
  patch: Partial<AppState>
  celebrations?: Omit<Celebration, 'id'>[]
}

export type AppStore = AppState & {
  celebrations: Celebration[]
  bossRecap: BossRecap | null
} & AppActions

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

function snapshot(state: AppState, today: string): RewardSnapshot {
  return {
    level: levelFromTotalXP(state.totalXP).level,
    achievements: unlockedAchievementIds(state, today),
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
      title: themeById(theme).name,
      detail: 'Theme unlocked',
    })
  }

  return queued
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      const withRewards = (
        mutate: (state: AppStore) => RewardedMutation | null,
        today: string = todayISO(),
      ) => {
        const current = get()
        const mutation = mutate(current)
        if (!mutation) return

        const applied = { ...current, ...mutation.patch }
        const unlockedThemes = Array.from(
          new Set([...applied.unlockedThemes, ...earnedThemeIds(applied.checkins)]),
        )
        const patch = { ...mutation.patch, unlockedThemes }
        const next = { ...applied, unlockedThemes }

        const queued = diffCelebrations(
          snapshot(current, today),
          snapshot(next, today),
        )
        const extra = (mutation.celebrations ?? []).map((celebration) => ({
          ...celebration,
          id: celebrationId(),
        }))

        set({
          ...patch,
          celebrations: [...current.celebrations, ...queued, ...extra],
        })
      }

      return {
        ...createInitialState(),
        celebrations: [],
        bossRecap: null,

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

            const month = monthKey(date)
            const granted = state.monthlyThresholdsGranted[month] ?? []
            const earned = pendingStampBonuses(
              stampCount(checkins, month),
              granted,
            )
            const stampBonus = earned.reduce(
              (total, threshold) => total + MONTHLY_STAMP_BONUS[threshold],
              0,
            )

            return {
              patch: {
                checkins,
                totalXP: state.totalXP + reward.xp,
                currencies: {
                  discipline:
                    state.currencies.discipline +
                    stampBonus +
                    (reward.currency === 'discipline'
                      ? reward.currencyAmount
                      : 0),
                  presence:
                    state.currencies.presence +
                    stampBonus +
                    (reward.currency === 'presence' ? reward.currencyAmount : 0),
                },
                monthlyThresholdsGranted: earned.length
                  ? {
                      ...state.monthlyThresholdsGranted,
                      [month]: [...granted, ...earned],
                    }
                  : state.monthlyThresholdsGranted,
              },
              celebrations: earned.map((threshold) => ({
                kind: 'bonus' as const,
                title: `${threshold} days stamped`,
                detail: `+${MONTHLY_STAMP_BONUS[threshold]} Discipline and Presence`,
              })),
            }
          }),

        nameCustomQuest: (name) =>
          withRewards((state) => {
            const trimmed = name.trim()
            if (!trimmed || trimmed === state.customQuest.name) return null

            return {
              patch: {
                customQuest: { ...state.customQuest, name: trimmed },
              },
            }
          }),

        checkCustomQuest: (date = todayISO()) =>
          withRewards((state) => {
            if (!state.customQuest.name) return null
            if (state.customQuest.checkins[date]) return null

            const checkins = { ...state.customQuest.checkins, [date]: true }
            const streak = currentStreak(Object.keys(checkins), date)

            return {
              patch: {
                customQuest: { ...state.customQuest, checkins },
                totalXP:
                  state.totalXP +
                  CHECKIN_BASE_XP +
                  Math.min(streak, STREAK_BONUS_CAP),
              },
            }
          }),

        logWeight: (weight, date = todayISO()) =>
          set((state) => ({
            weightLog: [
              ...state.weightLog.filter((entry) => entry.date !== date),
              { date, weight },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          })),

        equipTheme: (themeId) =>
          set((state) =>
            state.unlockedThemes.includes(themeId)
              ? { equippedTheme: themeId }
              : {},
          ),

        equipTitle: (title) =>
          set((state) =>
            title === null || unlockedTitles(state).includes(title)
              ? { equippedTitle: title }
              : {},
          ),

        purchaseFlourish: (id) =>
          set((state) => {
            const flourish = flourishById(id)
            if (!flourish) return {}
            if (state.purchasedFlourishes.includes(id)) return {}
            if (!canAfford(flourish, state.currencies)) return {}

            return {
              purchasedFlourishes: [...state.purchasedFlourishes, id],
              currencies: {
                ...state.currencies,
                [flourish.currency]:
                  state.currencies[flourish.currency] - flourish.cost,
              },
            }
          }),

        processMonthlyBoss: (today = todayISO()) => {
          const state = get()
          const month = monthKey(today)
          if (state.lastBossMonthProcessed === month) return

          const recap = buildBossRecap(state.checkins, previousMonth(today))

          if (!recap) {
            set({ lastBossMonthProcessed: month })
            return
          }

          withRewards(
            (current) => ({
              patch: {
                lastBossMonthProcessed: month,
                currencies: {
                  discipline:
                    current.currencies.discipline + recap.reward.discipline,
                  presence: current.currencies.presence + recap.reward.presence,
                },
              },
            }),
            today,
          )

          set({ bossRecap: recap })
        },

        dismissBossRecap: () => set({ bossRecap: null }),

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
