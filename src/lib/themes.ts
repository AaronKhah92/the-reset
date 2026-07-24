export interface Theme {
  id: string
  name: string
  glow: string
  description: string
}

export const DEFAULT_THEME_ID = 'default'

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Voidlight',
    glow: '#E7B155',
    description: 'The starting sky. Gold on deep blue.',
  },
  {
    id: 'frost',
    name: 'Frost',
    glow: '#7FD8FF',
    description: 'Cold, clear, quiet. Earned from evening calm.',
  },
  {
    id: 'verdant',
    name: 'Verdant',
    glow: '#7BE0A4',
    description: 'First green of the morning. Earned from the window.',
  },
  {
    id: 'twilight',
    name: 'Twilight',
    glow: '#B08CFF',
    description: 'The hour you spend with them. Earned from presence.',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    glow: '#5FF0C8',
    description: 'A full month, every single day. The rare one.',
  },
]

export function themeById(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]
}
