export type StarCluster = 'discipline' | 'presence' | 'journey'

export interface StarNode {
  id: string
  kind: 'achievement' | 'collection'
  cluster: StarCluster
  x: number
  y: number
}

export const STAR_NODES: StarNode[] = [
  { id: 'first_step', kind: 'achievement', cluster: 'discipline', x: 18, y: 80 },
  {
    id: 'morning_light',
    kind: 'collection',
    cluster: 'discipline',
    x: 11,
    y: 66,
  },
  {
    id: 'evening_calm',
    kind: 'collection',
    cluster: 'discipline',
    x: 27,
    y: 61,
  },
  { id: 'week_one', kind: 'achievement', cluster: 'discipline', x: 19, y: 47 },
  {
    id: 'full_calendar',
    kind: 'achievement',
    cluster: 'discipline',
    x: 31,
    y: 34,
  },
  { id: 'old_ghosts', kind: 'achievement', cluster: 'discipline', x: 13, y: 27 },

  { id: 'full_house', kind: 'achievement', cluster: 'presence', x: 81, y: 78 },
  { id: 'founder', kind: 'achievement', cluster: 'presence', x: 91, y: 63 },
  { id: 'family_time', kind: 'collection', cluster: 'presence', x: 73, y: 57 },
  {
    id: 'showing_up_them',
    kind: 'achievement',
    cluster: 'presence',
    x: 85,
    y: 43,
  },

  { id: 'collector', kind: 'achievement', cluster: 'journey', x: 50, y: 71 },
  { id: 'comeback', kind: 'achievement', cluster: 'journey', x: 43, y: 59 },
  { id: 'apprentice', kind: 'achievement', cluster: 'journey', x: 57, y: 49 },
  { id: 'adept', kind: 'achievement', cluster: 'journey', x: 47, y: 38 },
  { id: 'full_moon', kind: 'collection', cluster: 'journey', x: 61, y: 30 },
  { id: 'veteran', kind: 'achievement', cluster: 'journey', x: 50, y: 21 },
  { id: 'one_season', kind: 'achievement', cluster: 'journey', x: 63, y: 15 },
  { id: 'champion', kind: 'achievement', cluster: 'journey', x: 43, y: 10 },
]

export const CONSTELLATIONS: Record<StarCluster, string[]> = {
  discipline: [
    'first_step',
    'morning_light',
    'evening_calm',
    'week_one',
    'full_calendar',
    'old_ghosts',
  ],
  presence: ['full_house', 'founder', 'family_time', 'showing_up_them'],
  journey: [
    'collector',
    'comeback',
    'apprentice',
    'adept',
    'full_moon',
    'veteran',
    'one_season',
    'champion',
  ],
}

export function nodeById(id: string): StarNode | undefined {
  return STAR_NODES.find((node) => node.id === id)
}

export function constellationSegments(): {
  cluster: StarCluster
  from: StarNode
  to: StarNode
}[] {
  const segments: { cluster: StarCluster; from: StarNode; to: StarNode }[] = []

  for (const [cluster, ids] of Object.entries(CONSTELLATIONS)) {
    for (let index = 1; index < ids.length; index += 1) {
      const from = nodeById(ids[index - 1])
      const to = nodeById(ids[index])
      if (from && to) {
        segments.push({ cluster: cluster as StarCluster, from, to })
      }
    }
  }

  return segments
}
