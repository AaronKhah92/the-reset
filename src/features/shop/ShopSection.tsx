import { Heart, Shield } from 'lucide-react'
import { FLOURISHES, canAfford } from '../../lib/flourishes'
import { useAppStore } from '../../store/useAppStore'

export function ShopSection() {
  const currencies = useAppStore((state) => state.currencies)
  const purchased = useAppStore((state) => state.purchasedFlourishes)
  const purchaseFlourish = useAppStore((state) => state.purchaseFlourish)

  return (
    <section className="mt-8 flex flex-col gap-3">
      <h3 className="font-display text-base tracking-[0.05em] text-moonlight">
        Flourishes
      </h3>

      {FLOURISHES.map((flourish) => {
        const owned = purchased.includes(flourish.id)
        const affordable = canAfford(flourish, currencies)
        const Icon = flourish.currency === 'discipline' ? Shield : Heart

        return (
          <article
            key={flourish.id}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-obsidian/50 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-moonlight">
                {flourish.name}
              </h4>
              <p className="mt-0.5 text-[11px] leading-snug text-fog">
                {flourish.description}
              </p>
            </div>

            {owned ? (
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-fog">
                owned
              </span>
            ) : (
              <button
                type="button"
                onClick={() => purchaseFlourish(flourish.id)}
                disabled={!affordable}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 ${
                  flourish.currency === 'discipline'
                    ? 'border-gold/30 text-gold'
                    : 'border-violet/30 text-violet'
                } ${affordable ? '' : 'opacity-35'}`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span className="font-mono text-xs tabular-nums">
                  {flourish.cost}
                </span>
              </button>
            )}
          </article>
        )
      })}
    </section>
  )
}
