import { CalendarDays, Home, Sparkles, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

export type TabKey = 'home' | 'calendar' | 'codex' | 'character'

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'codex', label: 'Codex', icon: Sparkles },
  { key: 'character', label: 'Character', icon: UserRound },
]

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-white/6 bg-void/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md">
      <ul className="flex items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.key === active

          return (
            <li key={tab.key} className="flex-1">
              <motion.button
                type="button"
                onClick={() => onChange(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                className={`relative flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 ${
                  isActive ? 'text-gold' : 'text-fog'
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-wide">
                  {tab.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId={prefersReducedMotion ? undefined : 'tab-indicator'}
                    className="absolute inset-x-3 -top-1.5 h-0.5 rounded-full bg-gold"
                  />
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
