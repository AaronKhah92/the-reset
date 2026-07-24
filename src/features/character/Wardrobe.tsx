import { Check, Lock } from 'lucide-react'
import { unlockedTitles } from '../../lib/achievements'
import { todayISO } from '../../lib/date'
import { THEMES, themeById } from '../../lib/themes'
import { useAppStore } from '../../store/useAppStore'

export function Wardrobe() {
  const state = useAppStore()
  const equipTheme = useAppStore((store) => store.equipTheme)
  const equipTitle = useAppStore((store) => store.equipTitle)

  const titles = unlockedTitles(state, todayISO())

  return (
    <section className="mt-8 flex flex-col gap-4">
      <h3 className="font-display text-base tracking-[0.05em] text-moonlight">
        Wardrobe
      </h3>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
          Themes
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {THEMES.map((theme) => {
            const unlocked = state.unlockedThemes.includes(theme.id)
            const equipped = state.equippedTheme === theme.id

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => equipTheme(theme.id)}
                disabled={!unlocked}
                aria-pressed={equipped}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left ${
                  equipped
                    ? 'border-white/25 bg-white/6'
                    : 'border-white/8 bg-obsidian/40'
                } ${unlocked ? '' : 'opacity-45'}`}
              >
                <span
                  className="size-4 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.glow }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-moonlight">
                    {theme.name}
                  </span>
                </span>
                {!unlocked && (
                  <Lock className="size-3.5 shrink-0 text-fog" aria-hidden="true" />
                )}
                {equipped && (
                  <Check className="size-3.5 shrink-0 text-moonlight" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-fog/70">
          {themeById(state.equippedTheme).description}
        </p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
          Titles
        </p>

        {titles.length === 0 ? (
          <p className="mt-2 text-[13px] text-fog">
            Titles arrive with certain achievements.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => equipTitle(null)}
              aria-pressed={state.equippedTitle === null}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                state.equippedTitle === null
                  ? 'border-white/25 bg-white/6 text-moonlight'
                  : 'border-white/8 text-fog'
              }`}
            >
              None
            </button>

            {titles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => equipTitle(title)}
                aria-pressed={state.equippedTitle === title}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  state.equippedTitle === title
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-white/8 text-fog'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
