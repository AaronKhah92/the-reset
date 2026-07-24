import { describe, expect, it } from 'vitest'
import {
  checksOnDay,
  daysInMonth,
  isStamped,
  monthGrid,
  pendingStampBonuses,
  shiftMonth,
  stampCount,
} from './calendar'
import type { DayCheckins } from './types'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

describe('checksOnDay', () => {
  it('counts how many of the three landed', () => {
    expect(checksOnDay(undefined)).toBe(0)
    expect(checksOnDay(day({}))).toBe(0)
    expect(checksOnDay(day({ window: true }))).toBe(1)
    expect(checksOnDay(day({ window: true, cleanDay: true, kids: true }))).toBe(3)
  })
})

describe('isStamped', () => {
  it('treats any single check as a stamp', () => {
    expect(isStamped(day({ kids: true }))).toBe(true)
    expect(isStamped(day({}))).toBe(false)
  })
})

describe('stampCount', () => {
  it('counts stamped days within the month only', () => {
    const checkins = {
      '2026-03-01': day({ window: true }),
      '2026-03-02': day({ kids: true, cleanDay: true }),
      '2026-03-03': day({}),
      '2026-04-01': day({ window: true }),
    }
    expect(stampCount(checkins, '2026-03')).toBe(2)
    expect(stampCount(checkins, '2026-04')).toBe(1)
    expect(stampCount(checkins, '2026-05')).toBe(0)
  })
})

describe('pendingStampBonuses', () => {
  it('grants a threshold once and never again', () => {
    expect(pendingStampBonuses(4, [])).toEqual([])
    expect(pendingStampBonuses(5, [])).toEqual([5])
    expect(pendingStampBonuses(5, [5])).toEqual([])
    expect(pendingStampBonuses(15, [5])).toEqual([15])
    expect(pendingStampBonuses(15, [5, 15])).toEqual([])
  })

  it('can catch up on both thresholds at once', () => {
    expect(pendingStampBonuses(20, [])).toEqual([5, 15])
  })
})

describe('daysInMonth', () => {
  it('handles month lengths and leap years', () => {
    expect(daysInMonth('2026-01')).toBe(31)
    expect(daysInMonth('2026-02')).toBe(28)
    expect(daysInMonth('2028-02')).toBe(29)
    expect(daysInMonth('2026-04')).toBe(30)
  })
})

describe('monthGrid', () => {
  it('pads the leading days so weeks start on Monday', () => {
    const grid = monthGrid('2026-03')
    expect(grid[0]).toBeNull()
    expect(grid[6]).toBe('2026-03-01')
    expect(grid.at(-1)).toBe('2026-03-31')
  })

  it('has no padding when the month starts on a Monday', () => {
    const grid = monthGrid('2026-06')
    expect(grid[0]).toBe('2026-06-01')
  })

  it('emits every day of the month exactly once', () => {
    const grid = monthGrid('2028-02').filter(Boolean)
    expect(grid).toHaveLength(29)
    expect(new Set(grid).size).toBe(29)
  })
})

describe('shiftMonth', () => {
  it('moves across year boundaries', () => {
    expect(shiftMonth('2026-03', 1)).toBe('2026-04')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })
})
