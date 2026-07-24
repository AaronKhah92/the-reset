import { describe, expect, it } from 'vitest'
import { levelFromTotalXP, xpForLevel } from './xp'

describe('xpForLevel', () => {
  it('costs 80 for the first level and grows by 30 each time', () => {
    expect(xpForLevel(1)).toBe(80)
    expect(xpForLevel(2)).toBe(110)
    expect(xpForLevel(3)).toBe(140)
    expect(xpForLevel(10)).toBe(350)
  })
})

describe('levelFromTotalXP', () => {
  it('starts at level 1 with no XP', () => {
    expect(levelFromTotalXP(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 80,
      progress: 0,
    })
  })

  it('stays on level 1 until the cost is fully paid', () => {
    const progress = levelFromTotalXP(79)
    expect(progress.level).toBe(1)
    expect(progress.xpIntoLevel).toBe(79)
  })

  it('levels up exactly at the threshold', () => {
    const progress = levelFromTotalXP(80)
    expect(progress.level).toBe(2)
    expect(progress.xpIntoLevel).toBe(0)
    expect(progress.xpForNextLevel).toBe(110)
  })

  it('accumulates costs across levels', () => {
    expect(levelFromTotalXP(80 + 110).level).toBe(3)
    expect(levelFromTotalXP(80 + 110 - 1).level).toBe(2)
    expect(levelFromTotalXP(80 + 110 + 139).level).toBe(3)
    expect(levelFromTotalXP(80 + 110 + 140).level).toBe(4)
  })

  it('carries the remainder into the current level', () => {
    const progress = levelFromTotalXP(80 + 55)
    expect(progress.level).toBe(2)
    expect(progress.xpIntoLevel).toBe(55)
    expect(progress.progress).toBeCloseTo(55 / 110)
  })

  it('never regresses as XP grows', () => {
    let previous = 0
    for (let xp = 0; xp < 5000; xp += 37) {
      const { level } = levelFromTotalXP(xp)
      expect(level).toBeGreaterThanOrEqual(previous)
      previous = level
    }
  })

  it('treats invalid input as zero', () => {
    expect(levelFromTotalXP(-100).level).toBe(1)
    expect(levelFromTotalXP(Number.NaN).level).toBe(1)
  })
})
