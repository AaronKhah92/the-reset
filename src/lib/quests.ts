export interface QuestChapter {
  threshold: number
  title: string
  body: string
}

export const SIDE_QUEST_UNLOCK_LEVEL = 5

export const MAIN_QUEST_TITLE = 'The Reset'
export const SIDE_QUEST_TITLE = 'Kids Presence'

export const MAIN_QUEST_CHAPTERS: QuestChapter[] = [
  {
    threshold: 0,
    title: 'Breaking the Loop',
    body: "Every reset starts with noticing the loop. You're here. That's the whole first move.",
  },
  {
    threshold: 10,
    title: 'First Cracks of Light',
    body: "Ten times you chose the window or the clean day over the old pattern. The loop isn't broken yet — but it's cracked.",
  },
  {
    threshold: 30,
    title: 'Building the New Normal',
    body: 'This is the part where it stops being a diet and starts being just... what you do.',
  },
  {
    threshold: 70,
    title: 'The Long Stretch',
    body: "The exciting part is over and the durable part has started. That's not a downgrade. That's the goal.",
  },
  {
    threshold: 140,
    title: 'Old Ghosts',
    body: "Some days the old pattern is going to win. That's not the story ending. That's just a chapter with a rough patch in it.",
  },
  {
    threshold: 250,
    title: "Who You're Becoming",
    body: 'Less a version of yourself trying to lose weight. More just a version of yourself who eats like this now.',
  },
  {
    threshold: 400,
    title: 'The Reset, Continued',
    body: "There's no final boss here. Just Tuesday, then Wednesday, then the next one.",
  },
]

export const SIDE_QUEST_CHAPTERS: QuestChapter[] = [
  {
    threshold: 0,
    title: 'Showing Up',
    body: "Being there and being present aren't the same thing. This tracks the second one.",
  },
  {
    threshold: 10,
    title: 'In the Room',
    body: "Ten times you put the phone down first. They noticed, even if they didn't say it.",
  },
  {
    threshold: 30,
    title: 'All In',
    body: "This isn't about being a perfect parent. It's about being one who's there for the moments that actually happen.",
  },
  {
    threshold: 70,
    title: 'The Best Part of the Day',
    body: 'Eventually this stops being a task on a list and starts being the part of the day you look forward to.',
  },
]

export interface ChapterProgress {
  index: number
  chapter: QuestChapter
  next: QuestChapter | null
  progress: number
  toNext: number
  fraction: number
}

export function chapterFor(
  progress: number,
  chapters: QuestChapter[],
): ChapterProgress {
  const safeProgress = Math.max(0, Math.floor(progress))
  let index = 0

  for (let i = 0; i < chapters.length; i += 1) {
    if (safeProgress >= chapters[i].threshold) index = i
  }

  const chapter = chapters[index]
  const next = chapters[index + 1] ?? null

  if (!next) {
    return {
      index,
      chapter,
      next: null,
      progress: safeProgress,
      toNext: 0,
      fraction: 1,
    }
  }

  const span = next.threshold - chapter.threshold
  const into = safeProgress - chapter.threshold

  return {
    index,
    chapter,
    next,
    progress: safeProgress,
    toNext: next.threshold - safeProgress,
    fraction: span === 0 ? 1 : into / span,
  }
}
