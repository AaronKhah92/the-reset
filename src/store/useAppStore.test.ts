import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './useAppStore'
import { addDays } from '../lib/date'
import type { DayCheckins } from '../lib/types'

const TODAY = '2026-03-10'

function day(partial: Partial<DayCheckins>): DayCheckins {
  return { window: false, cleanDay: false, kids: false, ...partial }
}

beforeEach(() => {
  useAppStore.setState({
    totalXP: 0,
    currencies: { discipline: 0, presence: 0 },
    checkins: {},
    celebrations: [],
    unlockedThemes: ['default'],
    customQuest: { name: null, checkins: {} },
    weightLog: [],
    monthlyThresholdsGranted: {},
    equippedTheme: 'default',
    equippedTitle: null,
    purchasedFlourishes: [],
    lastBossMonthProcessed: null,
    bossRecap: null,
  })
})

function stampDays(count: number) {
  const checkins: Record<string, DayCheckins> = {}
  for (let index = 0; index < count; index += 1) {
    checkins[`2026-03-${String(index + 1).padStart(2, '0')}`] = day({
      window: true,
    })
  }
  useAppStore.setState({ checkins })
}

describe('check', () => {
  it('pays the first check of the day with its bonus', () => {
    useAppStore.getState().check('window', TODAY)

    const state = useAppStore.getState()
    expect(state.totalXP).toBe(26)
    expect(state.currencies.discipline).toBe(2)
    expect(state.currencies.presence).toBe(0)
    expect(state.checkins[TODAY]).toEqual(day({ window: true }))
  })

  it('pays later checks the same day without the bonus', () => {
    const { check } = useAppStore.getState()
    check('window', TODAY)
    check('cleanDay', TODAY)
    check('kids', TODAY)

    const state = useAppStore.getState()
    expect(state.totalXP).toBe(26 + 16 + 16)
    expect(state.currencies).toEqual({ discipline: 4, presence: 2 })
  })

  it('is idempotent and never takes XP back', () => {
    const { check } = useAppStore.getState()
    check('window', TODAY)
    const afterFirst = useAppStore.getState().totalXP

    check('window', TODAY)

    expect(useAppStore.getState().totalXP).toBe(afterFirst)
    expect(useAppStore.getState().currencies.discipline).toBe(2)
  })

  it('adds the running streak to the payout', () => {
    useAppStore.setState({
      checkins: {
        '2026-03-08': day({ window: true }),
        '2026-03-09': day({ window: true }),
      },
    })

    useAppStore.getState().check('window', TODAY)

    expect(useAppStore.getState().totalXP).toBe(15 + 3 + 10)
  })

  it('caps the streak bonus at 10 days', () => {
    const checkins: Record<string, DayCheckins> = {}
    for (let offset = 1; offset <= 20; offset += 1) {
      checkins[addDays(TODAY, -offset)] = day({ window: true })
    }
    useAppStore.setState({ checkins })

    useAppStore.getState().check('window', TODAY)

    expect(useAppStore.getState().totalXP).toBe(15 + 10 + 10)
  })

  it('leaves an untouched day alone rather than penalising it', () => {
    const { check } = useAppStore.getState()
    check('window', '2026-03-08')
    check('window', TODAY)

    const state = useAppStore.getState()
    expect(state.checkins['2026-03-09']).toBeUndefined()
    expect(state.totalXP).toBe(26 + 26)
  })
})

describe('monthly stamp bonuses', () => {
  it('grants the 5-stamp bonus once the fifth day is stamped', () => {
    stampDays(4)

    useAppStore.getState().check('kids', '2026-03-05')

    const state = useAppStore.getState()
    expect(state.monthlyThresholdsGranted['2026-03']).toEqual([5])
    expect(state.currencies.discipline).toBe(5)
    expect(state.currencies.presence).toBe(7)
    expect(state.celebrations.at(-1)).toMatchObject({
      kind: 'bonus',
      title: '5 days stamped',
    })
  })

  it('never re-grants a threshold already collected', () => {
    stampDays(4)
    useAppStore.getState().check('kids', '2026-03-05')
    const afterBonus = useAppStore.getState().currencies.discipline

    useAppStore.getState().check('window', '2026-03-06')

    expect(useAppStore.getState().currencies.discipline).toBe(afterBonus + 2)
    expect(useAppStore.getState().monthlyThresholdsGranted['2026-03']).toEqual([
      5,
    ])
  })

  it('keeps thresholds separate per month', () => {
    stampDays(5)
    useAppStore.setState({
      monthlyThresholdsGranted: { '2026-03': [5] },
    })

    useAppStore.getState().check('window', '2026-04-01')

    expect(
      useAppStore.getState().monthlyThresholdsGranted['2026-04'],
    ).toBeUndefined()
  })
})

describe('custom quest', () => {
  it('ignores an empty name', () => {
    useAppStore.getState().nameCustomQuest('   ')
    expect(useAppStore.getState().customQuest.name).toBeNull()
  })

  it('takes a trimmed name', () => {
    useAppStore.getState().nameCustomQuest('  Walk daily  ')
    expect(useAppStore.getState().customQuest.name).toBe('Walk daily')
  })

  it('cannot be checked before it is named', () => {
    useAppStore.getState().checkCustomQuest(TODAY)

    expect(useAppStore.getState().customQuest.checkins).toEqual({})
    expect(useAppStore.getState().totalXP).toBe(0)
  })

  it('pays XP but no currency, and only once per day', () => {
    const { nameCustomQuest, checkCustomQuest } = useAppStore.getState()
    nameCustomQuest('Walk daily')

    checkCustomQuest(TODAY)
    checkCustomQuest(TODAY)

    const state = useAppStore.getState()
    expect(state.totalXP).toBe(16)
    expect(state.currencies).toEqual({ discipline: 0, presence: 0 })
    expect(state.customQuest.checkins).toEqual({ [TODAY]: true })
  })

  it('does not count toward the three core checks', () => {
    const { nameCustomQuest, checkCustomQuest } = useAppStore.getState()
    nameCustomQuest('Walk daily')
    checkCustomQuest(TODAY)

    expect(useAppStore.getState().checkins[TODAY]).toBeUndefined()
  })
})

describe('weight log', () => {
  it('records an entry without paying any reward', () => {
    useAppStore.getState().logWeight(92.4, TODAY)

    const state = useAppStore.getState()
    expect(state.weightLog).toEqual([{ date: TODAY, weight: 92.4 }])
    expect(state.totalXP).toBe(0)
    expect(state.currencies).toEqual({ discipline: 0, presence: 0 })
    expect(state.celebrations).toEqual([])
  })

  it('replaces the entry for a day rather than duplicating it', () => {
    const { logWeight } = useAppStore.getState()
    logWeight(92.4, TODAY)
    logWeight(91.8, TODAY)

    expect(useAppStore.getState().weightLog).toEqual([
      { date: TODAY, weight: 91.8 },
    ])
  })

  it('keeps entries sorted by date', () => {
    const { logWeight } = useAppStore.getState()
    logWeight(90, '2026-03-12')
    logWeight(91, '2026-03-01')

    expect(useAppStore.getState().weightLog.map((entry) => entry.date)).toEqual([
      '2026-03-01',
      '2026-03-12',
    ])
  })
})

describe('reward wrapper', () => {
  it('queues the level-up before the achievement', () => {
    useAppStore.setState({ totalXP: 79 })

    useAppStore.getState().check('window', TODAY)

    const { celebrations, totalXP } = useAppStore.getState()
    expect(totalXP).toBe(105)
    expect(celebrations.map((celebration) => celebration.kind)).toEqual([
      'level-up',
      'achievement',
    ])
    expect(celebrations[0]).toMatchObject({ title: 'Level 2' })
    expect(celebrations[1]).toMatchObject({ title: 'First Step' })
  })

  it('stays quiet when nothing crosses a threshold', () => {
    useAppStore.getState().check('window', '2026-03-09')
    useAppStore.setState({ celebrations: [] })

    useAppStore.getState().check('cleanDay', '2026-03-09')

    expect(useAppStore.getState().celebrations).toEqual([])
  })

  it('dismisses a celebration by id', () => {
    useAppStore.getState().check('window', TODAY)

    const queued = useAppStore.getState().celebrations[0]
    useAppStore.getState().dismissCelebration(queued.id)

    expect(
      useAppStore.getState().celebrations.map((c) => c.id),
    ).not.toContain(queued.id)
  })

  it('unlocks a collection theme and celebrates it after the achievement', () => {
    for (let index = 1; index <= 6; index += 1) {
      useAppStore.getState().check('cleanDay', `2026-03-0${index}`)
    }
    useAppStore.setState({ celebrations: [] })

    useAppStore.getState().check('cleanDay', '2026-03-07')

    const { unlockedThemes, celebrations } = useAppStore.getState()
    expect(unlockedThemes).toContain('frost')

    const kinds = celebrations.map((celebration) => celebration.kind)
    expect(kinds).toContain('theme')
    expect(kinds.indexOf('achievement')).toBeLessThan(kinds.indexOf('theme'))
    expect(celebrations.find((c) => c.kind === 'theme')).toMatchObject({
      title: 'Frost',
    })
  })
})

describe('wardrobe and shop', () => {
  it('refuses to equip a theme that is not unlocked', () => {
    useAppStore.getState().equipTheme('aurora')
    expect(useAppStore.getState().equippedTheme).toBe('default')
  })

  it('equips an unlocked theme', () => {
    useAppStore.setState({ unlockedThemes: ['default', 'frost'] })
    useAppStore.getState().equipTheme('frost')
    expect(useAppStore.getState().equippedTheme).toBe('frost')
  })

  it('refuses a title that has not been earned', () => {
    useAppStore.getState().equipTitle('the Champion')
    expect(useAppStore.getState().equippedTitle).toBeNull()
  })

  it('equips an earned title and allows clearing it', () => {
    useAppStore.setState({ totalXP: 1000 })

    useAppStore.getState().equipTitle('the Apprentice')
    expect(useAppStore.getState().equippedTitle).toBe('the Apprentice')

    useAppStore.getState().equipTitle(null)
    expect(useAppStore.getState().equippedTitle).toBeNull()
  })

  it('will not sell a flourish you cannot afford', () => {
    useAppStore.getState().purchaseFlourish('gilded_frame')

    expect(useAppStore.getState().purchasedFlourishes).toEqual([])
    expect(useAppStore.getState().currencies.discipline).toBe(0)
  })

  it('charges once and only once', () => {
    useAppStore.setState({ currencies: { discipline: 100, presence: 0 } })

    useAppStore.getState().purchaseFlourish('gilded_frame')
    useAppStore.getState().purchaseFlourish('gilded_frame')

    expect(useAppStore.getState().purchasedFlourishes).toEqual(['gilded_frame'])
    expect(useAppStore.getState().currencies.discipline).toBe(70)
  })
})

describe('monthly boss fight', () => {
  it('does nothing on the first run of a month with no history', () => {
    useAppStore.getState().processMonthlyBoss(TODAY)

    const state = useAppStore.getState()
    expect(state.bossRecap).toBeNull()
    expect(state.lastBossMonthProcessed).toBe('2026-03')
    expect(state.currencies).toEqual({ discipline: 0, presence: 0 })
  })

  it('pays out and shows a recap for an active previous month', () => {
    useAppStore.setState({
      checkins: {
        '2026-02-01': day({ window: true }),
        '2026-02-02': day({ window: true, kids: true }),
      },
    })

    useAppStore.getState().processMonthlyBoss(TODAY)

    const state = useAppStore.getState()
    expect(state.bossRecap).toMatchObject({ month: '2026-02', stamps: 2 })
    expect(state.currencies).toEqual({ discipline: 10, presence: 10 })
    expect(state.lastBossMonthProcessed).toBe('2026-03')
  })

  it('never runs twice for the same month', () => {
    useAppStore.setState({
      checkins: { '2026-02-01': day({ window: true }) },
    })

    useAppStore.getState().processMonthlyBoss(TODAY)
    useAppStore.getState().dismissBossRecap()
    useAppStore.getState().processMonthlyBoss(TODAY)

    expect(useAppStore.getState().currencies).toEqual({
      discipline: 10,
      presence: 10,
    })
    expect(useAppStore.getState().bossRecap).toBeNull()
  })
})
