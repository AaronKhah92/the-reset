import { describe, expect, it } from 'vitest'
import { cumulativeCount, currentStreak, datesWithCheck, streakFor } from './streaks'
import type { DayCheckins } from './types'

const TODAY = '2026-03-10'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

describe('currentStreak', () => {
  it('is zero with no history', () => {
    expect(currentStreak([], TODAY)).toBe(0)
  })

  it('counts today when today is checked', () => {
    expect(currentStreak([TODAY], TODAY)).toBe(1)
  })

  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-03-08', '2026-03-09', TODAY], TODAY)).toBe(3)
  })

  it('survives today not being checked yet', () => {
    expect(currentStreak(['2026-03-08', '2026-03-09'], TODAY)).toBe(2)
  })

  it('resets only once a full day has passed unchecked', () => {
    expect(currentStreak(['2026-03-08'], TODAY)).toBe(0)
  })

  it('ignores runs before a gap', () => {
    const dates = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-09', TODAY]
    expect(currentStreak(dates, TODAY)).toBe(2)
  })

  it('does not care about input ordering', () => {
    expect(currentStreak([TODAY, '2026-03-08', '2026-03-09'], TODAY)).toBe(3)
  })

  it('spans month boundaries', () => {
    expect(currentStreak(['2026-02-28', '2026-03-01'], '2026-03-01')).toBe(2)
  })

  it('spans leap days', () => {
    expect(currentStreak(['2028-02-28', '2028-02-29'], '2028-02-29')).toBe(2)
  })
})

describe('datesWithCheck', () => {
  it('returns only the dates where that track is true, sorted', () => {
    const checkins = {
      '2026-03-09': day({ window: true }),
      '2026-03-07': day({ window: true, kids: true }),
      '2026-03-08': day({ kids: true }),
    }
    expect(datesWithCheck(checkins, 'window')).toEqual(['2026-03-07', '2026-03-09'])
    expect(datesWithCheck(checkins, 'cleanDay')).toEqual([])
  })
})

describe('streakFor', () => {
  it('tracks each check type independently', () => {
    const checkins = {
      '2026-03-09': day({ window: true, kids: true }),
      '2026-03-10': day({ window: true }),
    }
    expect(streakFor(checkins, 'window', TODAY)).toBe(2)
    expect(streakFor(checkins, 'kids', TODAY)).toBe(1)
    expect(streakFor(checkins, 'cleanDay', TODAY)).toBe(0)
  })
})

describe('cumulativeCount', () => {
  it('totals checks across days for the given tracks', () => {
    const checkins = {
      '2026-03-09': day({ window: true, cleanDay: true, kids: true }),
      '2026-03-10': day({ window: true }),
    }
    expect(cumulativeCount(checkins, ['window', 'cleanDay'])).toBe(3)
    expect(cumulativeCount(checkins, ['kids'])).toBe(1)
  })
})
