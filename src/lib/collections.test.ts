import { describe, expect, it } from 'vitest'
import {
  COLLECTIONS,
  collectionProgress,
  completedCollections,
  earnedThemeIds,
  monthsFullyStamped,
} from './collections'
import type { DayCheckins } from './types'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

function fillMonth(month: string, days: number): Record<string, DayCheckins> {
  const checkins: Record<string, DayCheckins> = {}
  for (let index = 1; index <= days; index += 1) {
    checkins[`${month}-${String(index).padStart(2, '0')}`] = day({ window: true })
  }
  return checkins
}

describe('the four collections', () => {
  it('map to the tuned targets and theme rewards', () => {
    expect(
      COLLECTIONS.map((collection) => [
        collection.id,
        collection.target,
        collection.themeId,
      ]),
    ).toEqual([
      ['evening_calm', 7, 'frost'],
      ['morning_light', 7, 'verdant'],
      ['family_time', 10, 'twilight'],
      ['full_moon', 1, 'aurora'],
    ])
  })
})

describe('collectionProgress', () => {
  it('counts toward the target and caps the fraction', () => {
    const checkins = {
      '2026-03-01': day({ cleanDay: true }),
      '2026-03-02': day({ cleanDay: true }),
    }
    const progress = collectionProgress(COLLECTIONS[0], checkins)
    expect(progress.value).toBe(2)
    expect(progress.complete).toBe(false)
    expect(progress.fraction).toBeCloseTo(2 / 7)
  })
})

describe('monthsFullyStamped', () => {
  it('needs every single day of the month', () => {
    expect(monthsFullyStamped(fillMonth('2026-02', 27))).toEqual([])
    expect(monthsFullyStamped(fillMonth('2026-02', 28))).toEqual(['2026-02'])
  })

  it('handles leap years', () => {
    expect(monthsFullyStamped(fillMonth('2028-02', 28))).toEqual([])
    expect(monthsFullyStamped(fillMonth('2028-02', 29))).toEqual(['2028-02'])
  })
})

describe('completedCollections', () => {
  it('is empty on a fresh save', () => {
    expect(completedCollections({})).toEqual([])
  })

  it('completes Evening Calm at seven clean days', () => {
    const checkins: Record<string, DayCheckins> = {}
    for (let index = 1; index <= 7; index += 1) {
      checkins[`2026-03-0${index}`] = day({ cleanDay: true })
    }
    expect(completedCollections(checkins).map((c) => c.id)).toEqual([
      'evening_calm',
    ])
    expect(earnedThemeIds(checkins)).toEqual(['frost'])
  })

  it('awards Aurora only for a complete month', () => {
    expect(earnedThemeIds(fillMonth('2026-04', 30))).toContain('aurora')
  })
})
