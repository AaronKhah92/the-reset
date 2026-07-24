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
  })
})

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

describe('reward wrapper', () => {
  it('queues a level-up celebration when the level changes', () => {
    useAppStore.setState({ totalXP: 79 })

    useAppStore.getState().check('window', TODAY)

    const { celebrations, totalXP } = useAppStore.getState()
    expect(totalXP).toBe(105)
    expect(celebrations).toHaveLength(1)
    expect(celebrations[0]).toMatchObject({
      kind: 'level-up',
      title: 'Level 2',
    })
  })

  it('stays quiet when nothing crosses a threshold', () => {
    useAppStore.getState().check('window', TODAY)

    expect(useAppStore.getState().celebrations).toEqual([])
  })

  it('dismisses a celebration by id', () => {
    useAppStore.setState({ totalXP: 79 })
    useAppStore.getState().check('window', TODAY)

    const queued = useAppStore.getState().celebrations[0]
    useAppStore.getState().dismissCelebration(queued.id)

    expect(useAppStore.getState().celebrations).toEqual([])
  })
})
