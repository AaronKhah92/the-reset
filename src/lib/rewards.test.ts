import { describe, expect, it } from 'vitest'
import { checkinReward } from './rewards'

describe('checkinReward', () => {
  it('pays base XP plus the streak, plus the first-check-of-day bonus', () => {
    expect(checkinReward('window', 1, true).xp).toBe(26)
  })

  it('drops the bonus for later checks the same day', () => {
    expect(checkinReward('window', 1, false).xp).toBe(16)
  })

  it('scales with the streak', () => {
    expect(checkinReward('cleanDay', 5, false).xp).toBe(20)
  })

  it('caps the streak bonus at 10', () => {
    expect(checkinReward('cleanDay', 10, false).xp).toBe(25)
    expect(checkinReward('cleanDay', 11, false).xp).toBe(25)
    expect(checkinReward('cleanDay', 400, false).xp).toBe(25)
  })

  it('routes window and clean day to Discipline', () => {
    expect(checkinReward('window', 1, false).currency).toBe('discipline')
    expect(checkinReward('cleanDay', 1, false).currency).toBe('discipline')
  })

  it('routes kids to Presence', () => {
    expect(checkinReward('kids', 1, false).currency).toBe('presence')
  })

  it('always grants 2 currency', () => {
    expect(checkinReward('kids', 7, true).currencyAmount).toBe(2)
  })

  it('never pays less than the base for a nonsense streak', () => {
    expect(checkinReward('window', -3, false).xp).toBe(15)
  })
})
