import { describe, expect, it } from 'vitest'
import {
  ceilingFor,
  deriveStats,
  disciplineValue,
  focusValue,
  presenceValue,
  vitalityValue,
} from './stats'
import { addDays } from './date'
import type { DayCheckins } from './types'

const TODAY = '2026-03-10'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

describe('discipline', () => {
  it('totals window and clean-day checks across all time', () => {
    const checkins = {
      '2026-03-09': day({ window: true, cleanDay: true, kids: true }),
      '2026-03-10': day({ window: true }),
    }
    expect(disciplineValue(checkins)).toBe(3)
  })
})

describe('presence', () => {
  it('counts kids checks only', () => {
    const checkins = {
      '2026-03-09': day({ window: true, kids: true }),
      '2026-03-10': day({ kids: true }),
    }
    expect(presenceValue(checkins)).toBe(2)
  })
})

describe('vitality', () => {
  it('counts active days inside the trailing 30-day window', () => {
    const checkins = {
      [TODAY]: day({ window: true }),
      [addDays(TODAY, -5)]: day({ kids: true }),
      [addDays(TODAY, -29)]: day({ cleanDay: true }),
    }
    expect(vitalityValue(checkins, TODAY)).toBe(3)
  })

  it('ignores days that have aged out of the window', () => {
    const checkins = {
      [addDays(TODAY, -30)]: day({ window: true }),
      [addDays(TODAY, -400)]: day({ window: true }),
    }
    expect(vitalityValue(checkins, TODAY)).toBe(0)
  })

  it('counts a day once no matter how many checks it holds', () => {
    const checkins = {
      [TODAY]: day({ window: true, cleanDay: true, kids: true }),
    }
    expect(vitalityValue(checkins, TODAY)).toBe(1)
  })
})

describe('focus', () => {
  it('measures the longest consecutive all-three run', () => {
    const checkins = {
      '2026-03-01': day({ window: true, cleanDay: true, kids: true }),
      '2026-03-02': day({ window: true, cleanDay: true, kids: true }),
      '2026-03-03': day({ window: true, cleanDay: true }),
      '2026-03-08': day({ window: true, cleanDay: true, kids: true }),
      '2026-03-09': day({ window: true, cleanDay: true, kids: true }),
      '2026-03-10': day({ window: true, cleanDay: true, kids: true }),
    }
    expect(focusValue(checkins)).toBe(3)
  })

  it('is zero when no day is complete', () => {
    expect(focusValue({ '2026-03-01': day({ window: true }) })).toBe(0)
  })
})

describe('the four stats are genuinely different formulas', () => {
  it('does not move in lockstep', () => {
    const checkins = {
      [addDays(TODAY, -40)]: day({ window: true, cleanDay: true, kids: true }),
      [TODAY]: day({ kids: true }),
    }
    const values = Object.fromEntries(
      deriveStats(checkins, TODAY).map((stat) => [stat.key, stat.value]),
    )

    expect(values.discipline).toBe(2)
    expect(values.presence).toBe(2)
    expect(values.vitality).toBe(1)
    expect(values.focus).toBe(1)
  })
})

describe('ceilingFor', () => {
  it('reaches for the next tier above the current value', () => {
    expect(ceilingFor('discipline', 0)).toBe(10)
    expect(ceilingFor('discipline', 10)).toBe(30)
    expect(ceilingFor('focus', 3)).toBe(7)
  })

  it('holds at the final tier once exceeded', () => {
    expect(ceilingFor('discipline', 5000)).toBe(400)
    expect(ceilingFor('vitality', 30)).toBe(30)
  })
})

describe('deriveStats', () => {
  it('returns all four stats with a bounded fraction', () => {
    const stats = deriveStats({ [TODAY]: day({ window: true }) }, TODAY)
    expect(stats.map((stat) => stat.key)).toEqual([
      'discipline',
      'vitality',
      'presence',
      'focus',
    ])
    for (const stat of stats) {
      expect(stat.fraction).toBeGreaterThanOrEqual(0)
      expect(stat.fraction).toBeLessThanOrEqual(1)
    }
  })
})
