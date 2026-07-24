import type { CurrencyKey } from './types'

export interface Flourish {
  id: string
  name: string
  description: string
  currency: CurrencyKey
  cost: number
}

export const FLOURISHES: Flourish[] = [
  {
    id: 'gilded_frame',
    name: 'Gilded Frame',
    description: 'Gold edging on the daily cards',
    currency: 'discipline',
    cost: 30,
  },
  {
    id: 'ember_drift',
    name: 'Ember Drift',
    description: 'Slow embers behind the sky',
    currency: 'presence',
    cost: 30,
  },
  {
    id: 'deep_field',
    name: 'Deep Field',
    description: 'Distant stars behind your constellations',
    currency: 'discipline',
    cost: 60,
  },
]

export function flourishById(id: string): Flourish | undefined {
  return FLOURISHES.find((flourish) => flourish.id === id)
}

export function canAfford(
  flourish: Flourish,
  currencies: Record<CurrencyKey, number>,
): boolean {
  return currencies[flourish.currency] >= flourish.cost
}
