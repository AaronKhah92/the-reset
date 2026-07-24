import { describe, expect, it } from 'vitest'
import {
  MAIN_QUEST_CHAPTERS,
  SIDE_QUEST_CHAPTERS,
  chapterFor,
} from './quests'

describe('quest chapter data', () => {
  it('keeps the tuned main quest thresholds', () => {
    expect(MAIN_QUEST_CHAPTERS.map((chapter) => chapter.threshold)).toEqual([
      0, 10, 30, 70, 140, 250, 400,
    ])
  })

  it('keeps the tuned side quest thresholds', () => {
    expect(SIDE_QUEST_CHAPTERS.map((chapter) => chapter.threshold)).toEqual([
      0, 10, 30, 70,
    ])
  })

  it('places Old Ghosts as main quest chapter 5', () => {
    expect(MAIN_QUEST_CHAPTERS[4].title).toBe('Old Ghosts')
  })
})

describe('chapterFor', () => {
  it('starts in the first chapter', () => {
    const result = chapterFor(0, MAIN_QUEST_CHAPTERS)
    expect(result.index).toBe(0)
    expect(result.chapter.title).toBe('Breaking the Loop')
    expect(result.next?.threshold).toBe(10)
    expect(result.toNext).toBe(10)
    expect(result.fraction).toBe(0)
  })

  it('advances exactly at a threshold', () => {
    expect(chapterFor(9, MAIN_QUEST_CHAPTERS).index).toBe(0)
    expect(chapterFor(10, MAIN_QUEST_CHAPTERS).index).toBe(1)
  })

  it('measures progress within the current chapter', () => {
    const result = chapterFor(20, MAIN_QUEST_CHAPTERS)
    expect(result.chapter.title).toBe('First Cracks of Light')
    expect(result.toNext).toBe(10)
    expect(result.fraction).toBeCloseTo(0.5)
  })

  it('caps at the final chapter', () => {
    const result = chapterFor(9999, MAIN_QUEST_CHAPTERS)
    expect(result.index).toBe(MAIN_QUEST_CHAPTERS.length - 1)
    expect(result.next).toBeNull()
    expect(result.toNext).toBe(0)
    expect(result.fraction).toBe(1)
  })

  it('treats negative progress as the opening chapter', () => {
    expect(chapterFor(-5, SIDE_QUEST_CHAPTERS).index).toBe(0)
  })
})
