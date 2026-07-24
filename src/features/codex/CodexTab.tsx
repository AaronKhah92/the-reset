import { useState } from 'react'
import { ACHIEVEMENTS, unlockedAchievementIds } from '../../lib/achievements'
import {
  COLLECTIONS,
  collectionById,
  collectionProgress,
} from '../../lib/collections'
import { todayISO } from '../../lib/date'
import { RARITY_BORDER, RARITY_LABELS, RARITY_TEXT } from '../../lib/rarity'
import { STAR_NODES } from '../../lib/starmap'
import { themeById } from '../../lib/themes'
import { levelFromTotalXP } from '../../lib/xp'
import { useAppStore } from '../../store/useAppStore'
import { StarMap } from './StarMap'
import type { Rarity } from '../../lib/types'

export function CodexTab() {
  const state = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const today = todayISO()
  const unlockedAchievements = unlockedAchievementIds(state, today)
  const completed = COLLECTIONS.filter(
    (collection) => collectionProgress(collection, state.checkins).complete,
  ).map((collection) => collection.id)

  const unlockedIds = new Set([...unlockedAchievements, ...completed])
  const { level } = levelFromTotalXP(state.totalXP)

  const achievement = ACHIEVEMENTS.find((item) => item.id === selectedId)
  const collection = selectedId ? collectionById(selectedId) : undefined
  const selectedRarity: Rarity | undefined =
    achievement?.rarity ?? collection?.rarity

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg tracking-[0.05em] text-moonlight">
          Codex
        </h2>
        <p className="font-mono text-xs text-fog tabular-nums">
          {unlockedIds.size} / {STAR_NODES.length} lit
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/6 bg-void/60">
        <StarMap
          unlockedIds={unlockedIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          level={level}
          deepField={state.purchasedFlourishes.includes('deep_field')}
        />
      </div>

      {!selectedId && (
        <p className="text-center text-xs leading-relaxed text-fog/70">
          Every achievement and collection is a star. Tap one to read it.
        </p>
      )}

      {selectedId && (achievement || collection) && (
        <article
          className={`rounded-2xl border bg-obsidian/60 px-4 py-4 ${
            selectedRarity ? RARITY_BORDER[selectedRarity] : 'border-white/8'
          }`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <p
              className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                selectedRarity ? RARITY_TEXT[selectedRarity] : 'text-fog'
              }`}
            >
              {selectedRarity ? RARITY_LABELS[selectedRarity] : ''}
              {collection ? ' collection' : ''}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fog">
              {unlockedIds.has(selectedId) ? 'lit' : 'unlit'}
            </p>
          </div>

          <h3 className="mt-1.5 font-display text-lg leading-tight text-moonlight">
            {achievement?.name ?? collection?.name}
          </h3>

          <p className="mt-1.5 text-[13px] leading-relaxed text-fog">
            {achievement?.description ?? collection?.description}
          </p>

          {achievement?.title && (
            <p className="mt-2 text-xs text-fog">
              Grants the title{' '}
              <span className="text-moonlight">{achievement.title}</span>
            </p>
          )}

          {collection && (
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-fog">
                  Unlocks the{' '}
                  <span className="text-moonlight">
                    {themeById(collection.themeId).name}
                  </span>{' '}
                  theme
                </p>
                <p className="font-mono text-xs text-fog tabular-nums">
                  {collectionProgress(collection, state.checkins).value} /{' '}
                  {collection.target}
                </p>
              </div>

              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{
                    width: `${
                      collectionProgress(collection, state.checkins).fraction * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </article>
      )}
    </section>
  )
}
