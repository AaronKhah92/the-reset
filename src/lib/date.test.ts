import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, monthKey, toISODate } from './date'

describe('toISODate', () => {
  it('formats local calendar dates with zero padding', () => {
    expect(toISODate(new Date(2026, 2, 9, 23, 30))).toBe('2026-03-09')
    expect(toISODate(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01')
  })
})

describe('addDays', () => {
  it('moves forward and backward', () => {
    expect(addDays('2026-03-10', 1)).toBe('2026-03-11')
    expect(addDays('2026-03-10', -1)).toBe('2026-03-09')
  })

  it('crosses month and year boundaries', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('handles leap years', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
  })

  it('is stable across daylight saving transitions', () => {
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02')
  })
})

describe('daysBetween', () => {
  it('counts whole calendar days', () => {
    expect(daysBetween('2026-03-10', '2026-03-10')).toBe(0)
    expect(daysBetween('2026-03-10', '2026-03-13')).toBe(3)
    expect(daysBetween('2026-03-13', '2026-03-10')).toBe(-3)
  })

  it('counts across a DST boundary', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
  })
})

describe('monthKey', () => {
  it('reduces a date to YYYY-MM', () => {
    expect(monthKey('2026-03-10')).toBe('2026-03')
  })
})
