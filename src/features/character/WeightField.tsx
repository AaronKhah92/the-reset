import { useState } from 'react'
import { todayISO } from '../../lib/date'
import { useAppStore } from '../../store/useAppStore'

export function WeightField() {
  const weightLog = useAppStore((state) => state.weightLog)
  const logWeight = useAppStore((state) => state.logWeight)
  const [draft, setDraft] = useState('')

  const latest = weightLog.at(-1)

  return (
    <section className="mt-8 border-t border-white/6 pt-5">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const parsed = Number.parseFloat(draft)
          if (!Number.isFinite(parsed) || parsed <= 0) return
          logWeight(parsed, todayISO())
          setDraft('')
        }}
      >
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog/70">
            Weight, if you feel like it
          </span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            placeholder={latest ? String(latest.weight) : '—'}
            className="w-full rounded-xl border border-white/8 bg-void/60 px-3 py-2 font-mono text-sm text-moonlight outline-none placeholder:text-fog/40 focus:border-white/20"
          />
        </label>

        <button
          type="submit"
          disabled={!draft.trim()}
          className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm text-fog disabled:opacity-40"
        >
          Log
        </button>
      </form>

      {latest && (
        <p className="mt-2 font-mono text-[11px] text-fog/60 tabular-nums">
          Last logged {latest.weight} on {latest.date}
        </p>
      )}
    </section>
  )
}
