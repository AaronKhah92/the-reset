import type { Rarity } from './types'

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#8D8FB0',
  rare: '#34D9C4',
  epic: '#9D7CFF',
  legendary: '#E7B155',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

export const RARITY_TEXT: Record<Rarity, string> = {
  common: 'text-fog',
  rare: 'text-teal',
  epic: 'text-violet',
  legendary: 'text-gold',
}

export const RARITY_BORDER: Record<Rarity, string> = {
  common: 'border-fog/30',
  rare: 'border-teal/40',
  epic: 'border-violet/40',
  legendary: 'border-gold/45',
}
