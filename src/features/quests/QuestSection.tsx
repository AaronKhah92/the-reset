import {
  MAIN_QUEST_CHAPTERS,
  SIDE_QUEST_CHAPTERS,
  SIDE_QUEST_UNLOCK_LEVEL,
  chapterFor,
} from '../../lib/quests'
import { cumulativeCount } from '../../lib/streaks'
import { levelFromTotalXP } from '../../lib/xp'
import { useAppStore } from '../../store/useAppStore'
import { CustomQuestCard } from './CustomQuestCard'
import { QuestChapterCard } from './QuestChapterCard'

export function QuestSection() {
  const checkins = useAppStore((state) => state.checkins)
  const totalXP = useAppStore((state) => state.totalXP)

  const { level } = levelFromTotalXP(totalXP)
  const mainProgress = cumulativeCount(checkins, ['window', 'cleanDay'])
  const sideProgress = cumulativeCount(checkins, ['kids'])
  const sideUnlocked = level >= SIDE_QUEST_UNLOCK_LEVEL

  return (
    <section className="mt-8 flex flex-col gap-3">
      <h2 className="font-display text-lg tracking-[0.05em] text-moonlight">
        Quests
      </h2>

      <QuestChapterCard
        eyebrow="Main Quest · The Reset"
        accent="teal"
        chapter={chapterFor(mainProgress, MAIN_QUEST_CHAPTERS)}
      />

      <QuestChapterCard
        eyebrow="Side Quest · Kids Presence"
        accent="violet"
        chapter={chapterFor(sideProgress, SIDE_QUEST_CHAPTERS)}
        lockedUntil={
          sideUnlocked
            ? undefined
            : `Opens at level ${SIDE_QUEST_UNLOCK_LEVEL}. Your kids checks are already counting.`
        }
      />

      <CustomQuestCard />
    </section>
  )
}
