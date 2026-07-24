import { Moon, Users, Utensils } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CheckKey } from '../../lib/types'

export type CheckAccent = 'gold' | 'violet'

export interface CheckDefinition {
  key: CheckKey
  label: string
  description: string
  icon: LucideIcon
  accent: CheckAccent
}

export const CHECK_DEFINITIONS: CheckDefinition[] = [
  {
    key: 'window',
    label: 'Stayed in the window',
    description: 'Ate within your eating window today',
    icon: Utensils,
    accent: 'gold',
  },
  {
    key: 'cleanDay',
    label: 'Clean day',
    description: 'Skipped the late-night pattern',
    icon: Moon,
    accent: 'gold',
  },
  {
    key: 'kids',
    label: 'Present with the kids',
    description: 'Read, played, or put the phone down',
    icon: Users,
    accent: 'violet',
  },
]
