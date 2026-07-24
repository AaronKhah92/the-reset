import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS } from './achievements'
import { COLLECTIONS } from './collections'
import { CONSTELLATIONS, STAR_NODES, constellationSegments } from './starmap'

describe('the sky covers everything exactly once', () => {
  it('has a star for every achievement and collection', () => {
    const expected = [
      ...ACHIEVEMENTS.map((achievement) => achievement.id),
      ...COLLECTIONS.map((collection) => collection.id),
    ].sort()

    expect(STAR_NODES.map((node) => node.id).sort()).toEqual(expected)
  })

  it('has no duplicate stars', () => {
    const ids = STAR_NODES.map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('labels each star with the right kind', () => {
    const collectionIds = new Set(COLLECTIONS.map((c) => c.id))

    for (const node of STAR_NODES) {
      expect(node.kind).toBe(
        collectionIds.has(node.id) ? 'collection' : 'achievement',
      )
    }
  })

  it('keeps every star inside the canvas', () => {
    for (const node of STAR_NODES) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.x).toBeLessThanOrEqual(100)
      expect(node.y).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeLessThanOrEqual(100)
    }
  })
})

describe('constellations', () => {
  it('references only stars that exist', () => {
    const known = new Set(STAR_NODES.map((node) => node.id))

    for (const ids of Object.values(CONSTELLATIONS)) {
      for (const id of ids) {
        expect(known.has(id)).toBe(true)
      }
    }
  })

  it('places every star in exactly one constellation', () => {
    const placed = Object.values(CONSTELLATIONS).flat()
    expect(placed.sort()).toEqual(STAR_NODES.map((node) => node.id).sort())
  })

  it('draws one fewer segment than the stars it joins', () => {
    const expected = Object.values(CONSTELLATIONS).reduce(
      (total, ids) => total + Math.max(ids.length - 1, 0),
      0,
    )
    expect(constellationSegments()).toHaveLength(expected)
  })
})
