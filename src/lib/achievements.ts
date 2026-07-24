import { completedCollections, monthsFullyStamped } from './collections'
import { daysBetween, todayISO } from './date'
import { MAIN_QUEST_CHAPTERS, chapterFor } from './quests'
import { isStamped } from './calendar'
import {
  cumulativeCount,
  datesWithCheck,
  fullHouseDates,
  longestStreak,
} from './streaks'
import { levelFromTotalXP } from './xp'
import type { AppState, CheckKey, DayCheckins, Rarity } from './types'

export const COMEBACK_GAP_DAYS = 4
export const ONE_SEASON_DAYS = 90

const TRACKS: CheckKey[] = ['window', 'cleanDay', 'kids']

export interface Achievement {
  id: string
  name: string
  rarity: Rarity
  description: string
  title?: string
  isUnlocked: (state: AppState, today: string) => boolean
}

export function hasComeback(checkins: Record<string, DayCheckins>): boolean {
  const stamped = Object.keys(checkins)
    .filter((date) => isStamped(checkins[date]))
    .sort()

  for (let index = 1; index < stamped.length; index += 1) {
    if (daysBetween(stamped[index - 1], stamped[index]) >= COMEBACK_GAP_DAYS) {
      return true
    }
  }

  return false
}

export function bestTrackStreak(
  checkins: Record<string, DayCheckins>,
): number {
  return Math.max(
    0,
    ...TRACKS.map((track) => longestStreak(datesWithCheck(checkins, track))),
  )
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    name: 'First Step',
    rarity: 'common',
    description: 'Check in for the first time',
    isUnlocked: (state) => cumulativeCount(state.checkins, TRACKS) > 0,
  },
  {
    id: 'full_house',
    name: 'Full House',
    rarity: 'common',
    description: 'All three checks in a single day',
    isUnlocked: (state) => fullHouseDates(state.checkins).length > 0,
  },
  {
    id: 'founder',
    name: 'Founder',
    rarity: 'common',
    description: 'Name a quest of your own',
    isUnlocked: (state) => state.customQuest.name !== null,
  },
  {
    id: 'week_one',
    name: 'Week One',
    rarity: 'rare',
    description: 'A seven day streak on any single track',
    isUnlocked: (state) => bestTrackStreak(state.checkins) >= 7,
  },
  {
    id: 'showing_up_them',
    name: 'Showing Up For Them',
    rarity: 'rare',
    description: 'Ten days present with the kids',
    isUnlocked: (state) => cumulativeCount(state.checkins, ['kids']) >= 10,
  },
  {
    id: 'collector',
    name: 'Collector',
    rarity: 'rare',
    description: 'Complete your first collection',
    isUnlocked: (state) => completedCollections(state.checkins).length >= 1,
  },
  {
    id: 'comeback',
    name: 'The Comeback',
    rarity: 'epic',
    title: 'The Returner',
    description: 'Come back after three or more days away',
    isUnlocked: (state) => hasComeback(state.checkins),
  },
  {
    id: 'full_calendar',
    name: 'Full Calendar',
    rarity: 'epic',
    description: 'Stamp every day of a calendar month',
    isUnlocked: (state) => monthsFullyStamped(state.checkins).length > 0,
  },
  {
    id: 'old_ghosts',
    name: 'Old Ghosts',
    rarity: 'epic',
    description: 'Reach chapter five of the main quest',
    isUnlocked: (state) =>
      chapterFor(
        cumulativeCount(state.checkins, ['window', 'cleanDay']),
        MAIN_QUEST_CHAPTERS,
      ).index >= 4,
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    rarity: 'epic',
    title: 'the Apprentice',
    description: 'Reach level 5',
    isUnlocked: (state) => levelFromTotalXP(state.totalXP).level >= 5,
  },
  {
    id: 'adept',
    name: 'Adept',
    rarity: 'epic',
    title: 'the Adept',
    description: 'Reach level 10',
    isUnlocked: (state) => levelFromTotalXP(state.totalXP).level >= 10,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    rarity: 'legendary',
    title: 'the Veteran',
    description: 'Reach level 20',
    isUnlocked: (state) => levelFromTotalXP(state.totalXP).level >= 20,
  },
  {
    id: 'champion',
    name: 'Champion',
    rarity: 'legendary',
    title: 'the Champion',
    description: 'Reach level 30',
    isUnlocked: (state) => levelFromTotalXP(state.totalXP).level >= 30,
  },
  {
    id: 'one_season',
    name: 'One Season',
    rarity: 'legendary',
    description: 'Ninety days since you started',
    isUnlocked: (state, today) =>
      daysBetween(state.startedAt, today) >= ONE_SEASON_DAYS,
  },
]

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)
}

export function unlockedAchievementIds(
  state: AppState,
  today: string = todayISO(),
): string[] {
  return ACHIEVEMENTS.filter((achievement) =>
    achievement.isUnlocked(state, today),
  ).map((achievement) => achievement.id)
}

export function unlockedTitles(
  state: AppState,
  today: string = todayISO(),
): string[] {
  const unlocked = new Set(unlockedAchievementIds(state, today))

  return ACHIEVEMENTS.filter(
    (achievement) => achievement.title && unlocked.has(achievement.id),
  ).map((achievement) => achievement.title as string)
}
