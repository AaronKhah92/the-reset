import { describe, expect, it } from 'vitest'
import {
  ACHIEVEMENTS,
  bestTrackStreak,
  hasComeback,
  unlockedAchievementIds,
  unlockedTitles,
} from './achievements'
import { addDays } from './date'
import type { AppState, DayCheckins } from './types'

const TODAY = '2026-03-10'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

function state(overrides: Partial<AppState> = {}): AppState {
  return {
    version: 1,
    startedAt: TODAY,
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
    ...overrides,
  }
}

function runOfDays(count: number, partial: Partial<DayCheckins>) {
  const checkins: Record<string, DayCheckins> = {}
  for (let offset = 0; offset < count; offset += 1) {
    checkins[addDays(TODAY, -offset)] = day(partial)
  }
  return checkins
}

describe('the ported achievement list', () => {
  it('has all fourteen with the tuned rarities', () => {
    expect(ACHIEVEMENTS).toHaveLength(14)
    expect(ACHIEVEMENTS.map((achievement) => achievement.id)).toEqual([
      'first_step',
      'full_house',
      'founder',
      'week_one',
      'showing_up_them',
      'collector',
      'comeback',
      'full_calendar',
      'old_ghosts',
      'apprentice',
      'adept',
      'veteran',
      'champion',
      'one_season',
    ])
  })

  it('carries the titles the brief specifies', () => {
    const titled = Object.fromEntries(
      ACHIEVEMENTS.filter((a) => a.title).map((a) => [a.id, a.title]),
    )
    expect(titled).toEqual({
      comeback: 'The Returner',
      apprentice: 'the Apprentice',
      adept: 'the Adept',
      veteran: 'the Veteran',
      champion: 'the Champion',
    })
  })

  it('unlocks nothing on a fresh save', () => {
    expect(unlockedAchievementIds(state(), TODAY)).toEqual([])
  })
})

describe('individual conditions', () => {
  it('first_step needs a single check', () => {
    const unlocked = unlockedAchievementIds(
      state({ checkins: { [TODAY]: day({ window: true }) } }),
      TODAY,
    )
    expect(unlocked).toContain('first_step')
    expect(unlocked).not.toContain('full_house')
  })

  it('full_house needs all three in one day', () => {
    const split = {
      '2026-03-09': day({ window: true, cleanDay: true }),
      [TODAY]: day({ kids: true }),
    }
    expect(unlockedAchievementIds(state({ checkins: split }), TODAY)).not.toContain(
      'full_house',
    )

    const together = {
      [TODAY]: day({ window: true, cleanDay: true, kids: true }),
    }
    expect(
      unlockedAchievementIds(state({ checkins: together }), TODAY),
    ).toContain('full_house')
  })

  it('founder needs a named custom quest', () => {
    expect(
      unlockedAchievementIds(
        state({ customQuest: { name: 'Walk', checkins: {} } }),
        TODAY,
      ),
    ).toContain('founder')
  })

  it('week_one needs seven consecutive days on one track', () => {
    expect(bestTrackStreak(runOfDays(6, { window: true }))).toBe(6)
    expect(
      unlockedAchievementIds(
        state({ checkins: runOfDays(6, { window: true }) }),
        TODAY,
      ),
    ).not.toContain('week_one')
    expect(
      unlockedAchievementIds(
        state({ checkins: runOfDays(7, { window: true }) }),
        TODAY,
      ),
    ).toContain('week_one')
  })

  it('week_one does not add different tracks together', () => {
    const mixed: Record<string, DayCheckins> = {}
    for (let offset = 0; offset < 4; offset += 1) {
      mixed[addDays(TODAY, -offset)] = day({ window: true })
    }
    for (let offset = 4; offset < 8; offset += 1) {
      mixed[addDays(TODAY, -offset)] = day({ kids: true })
    }
    expect(bestTrackStreak(mixed)).toBe(4)
  })

  it('showing_up_them needs ten kids checks', () => {
    expect(
      unlockedAchievementIds(
        state({ checkins: runOfDays(10, { kids: true }) }),
        TODAY,
      ),
    ).toContain('showing_up_them')
  })

  it('old_ghosts needs main quest chapter five', () => {
    const almost = state({ checkins: runOfDays(69, { window: true, cleanDay: true }) })
    expect(unlockedAchievementIds(almost, TODAY)).not.toContain('old_ghosts')

    const there = state({ checkins: runOfDays(70, { window: true, cleanDay: true }) })
    expect(unlockedAchievementIds(there, TODAY)).toContain('old_ghosts')
  })

  it('level achievements track the XP curve', () => {
    expect(unlockedAchievementIds(state({ totalXP: 1000 }), TODAY)).toContain(
      'apprentice',
    )
    expect(unlockedAchievementIds(state({ totalXP: 1000 }), TODAY)).not.toContain(
      'veteran',
    )
    expect(unlockedAchievementIds(state({ totalXP: 100000 }), TODAY)).toContain(
      'champion',
    )
  })

  it('one_season needs ninety days since the start', () => {
    const started = state({ startedAt: '2026-01-01' })
    expect(unlockedAchievementIds(started, '2026-03-30')).not.toContain(
      'one_season',
    )
    expect(unlockedAchievementIds(started, '2026-04-01')).toContain('one_season')
  })
})

describe('the comeback is celebrated, not punished', () => {
  it('needs a gap of three or more missed days', () => {
    expect(
      hasComeback({
        '2026-03-01': day({ window: true }),
        '2026-03-02': day({ window: true }),
      }),
    ).toBe(false)

    expect(
      hasComeback({
        '2026-03-01': day({ window: true }),
        '2026-03-04': day({ window: true }),
      }),
    ).toBe(false)

    expect(
      hasComeback({
        '2026-03-01': day({ window: true }),
        '2026-03-05': day({ window: true }),
      }),
    ).toBe(true)
  })

  it('ignores unstamped days sitting in the log', () => {
    expect(
      hasComeback({
        '2026-03-01': day({ window: true }),
        '2026-03-03': day({}),
        '2026-03-05': day({ window: true }),
      }),
    ).toBe(true)
  })
})

describe('achievements never lock back up', () => {
  it('stays unlocked after a long gap', () => {
    const earned = state({ checkins: runOfDays(7, { window: true }) })
    expect(unlockedAchievementIds(earned, TODAY)).toContain('week_one')

    const muchLater = addDays(TODAY, 200)
    expect(unlockedAchievementIds(earned, muchLater)).toContain('week_one')
  })
})

describe('unlockedTitles', () => {
  it('lists only titles from unlocked achievements', () => {
    expect(unlockedTitles(state(), TODAY)).toEqual([])
    expect(unlockedTitles(state({ totalXP: 1000 }), TODAY)).toContain(
      'the Apprentice',
    )
  })
})
