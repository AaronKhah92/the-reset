import { describe, expect, it } from 'vitest'
import { bossReward, buildBossRecap, previousMonth } from './boss'
import type { DayCheckins } from './types'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

describe('bossReward', () => {
  it('never pays less than the floor', () => {
    expect(bossReward(0)).toEqual({ discipline: 10, presence: 10 })
    expect(bossReward(6)).toEqual({ discipline: 10, presence: 10 })
  })

  it('scales at three per stamp above the floor', () => {
    expect(bossReward(10)).toEqual({ discipline: 15, presence: 15 })
    expect(bossReward(31)).toEqual({ discipline: 47, presence: 46 })
  })

  it('splits odd totals without losing a point', () => {
    const reward = bossReward(31)
    expect(reward.discipline + reward.presence).toBe(93)
  })
})

describe('buildBossRecap', () => {
  it('returns nothing for a month with no activity', () => {
    expect(buildBossRecap({}, '2026-02')).toBeNull()
    expect(
      buildBossRecap({ '2026-03-01': day({ window: true }) }, '2026-02'),
    ).toBeNull()
  })

  it('summarises only the month in question', () => {
    const checkins = {
      '2026-02-01': day({ window: true, kids: true }),
      '2026-02-02': day({ cleanDay: true }),
      '2026-03-01': day({ window: true }),
    }
    const recap = buildBossRecap(checkins, '2026-02')

    expect(recap).toMatchObject({ month: '2026-02', stamps: 2, checks: 3 })
    expect(recap?.reward).toEqual({ discipline: 10, presence: 10 })
  })
})

describe('previousMonth', () => {
  it('steps back across a year boundary', () => {
    expect(previousMonth('2026-01-15')).toBe('2025-12')
    expect(previousMonth('2026-03-01')).toBe('2026-02')
  })
})
