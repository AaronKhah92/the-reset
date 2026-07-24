import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { todayISO } from '../../lib/date'
import { currentStreak } from '../../lib/streaks'
import { useAppStore } from '../../store/useAppStore'

export function CustomQuestCard() {
  const customQuest = useAppStore((state) => state.customQuest)
  const nameCustomQuest = useAppStore((state) => state.nameCustomQuest)
  const checkCustomQuest = useAppStore((state) => state.checkCustomQuest)
  const prefersReducedMotion = useReducedMotion()
  const [draft, setDraft] = useState('')

  const today = todayISO()
  const checkedToday = Boolean(customQuest.checkins[today])
  const streak = currentStreak(Object.keys(customQuest.checkins), today)

  if (!customQuest.name) {
    return (
      <article className="rounded-2xl border border-dashed border-white/12 bg-obsidian/30 px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
          Open quest slot
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fog">
          One thing of your own. Optional, and it never joins the daily three.
        </p>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            nameCustomQuest(draft)
            setDraft('')
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Name your quest"
            maxLength={40}
            aria-label="Name your quest"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-void/60 px-3 py-2 text-sm text-moonlight outline-none placeholder:text-fog/60 focus:border-teal/40"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex shrink-0 items-center gap-1 rounded-xl border border-teal/30 bg-teal/10 px-3 py-2 text-sm font-medium text-teal disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add
          </button>
        </form>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-white/8 bg-obsidian/60 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
            Your quest
          </p>
          <h3 className="mt-1 truncate font-display text-base text-moonlight">
            {customQuest.name}
          </h3>
          {streak > 0 && (
            <p className="mt-1 font-mono text-[11px] text-teal/80 tabular-nums">
              {streak} day{streak === 1 ? '' : 's'} running
            </p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={() => checkCustomQuest()}
          disabled={checkedToday}
          aria-pressed={checkedToday}
          aria-label={
            checkedToday ? 'Checked in today' : `Check in on ${customQuest.name}`
          }
          whileTap={
            prefersReducedMotion || checkedToday ? undefined : { scale: 0.94 }
          }
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
            checkedToday
              ? 'border-transparent bg-teal text-void'
              : 'border-white/12 bg-white/4 text-fog'
          }`}
        >
          <Check className="size-5" strokeWidth={3} aria-hidden="true" />
        </motion.button>
      </div>
    </article>
  )
}
