import type { LucideIcon } from 'lucide-react'
import type { CurrencyKey } from '../../lib/types'

const CHIP_STYLES: Record<CurrencyKey, string> = {
  discipline: 'border-gold/25 text-gold',
  presence: 'border-violet/25 text-violet',
}

interface CurrencyChipProps {
  currency: CurrencyKey
  amount: number
  icon: LucideIcon
  label: string
}

export function CurrencyChip({
  currency,
  amount,
  icon: Icon,
  label,
}: CurrencyChipProps) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border bg-white/3 px-2.5 py-1 ${CHIP_STYLES[currency]}`}
      title={label}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="font-mono text-xs font-semibold tabular-nums">
        {amount}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
