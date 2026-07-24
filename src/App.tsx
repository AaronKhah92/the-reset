import { useEffect, useState } from 'react'
import { AmbientEmbers } from './components/AmbientEmbers'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import type { TabKey } from './components/TabBar'
import { CelebrationToasts } from './components/ui/CelebrationToasts'
import { BossRecapModal } from './features/boss/BossRecapModal'
import { CalendarTab } from './features/calendar/CalendarTab'
import { CharacterTab } from './features/character/CharacterTab'
import { DailyCheckins } from './features/checkins/DailyCheckins'
import { CodexTab } from './features/codex/CodexTab'
import { QuestSection } from './features/quests/QuestSection'
import { themeById } from './lib/themes'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const [tab, setTab] = useState<TabKey>('home')
  const equippedTheme = useAppStore((state) => state.equippedTheme)
  const processMonthlyBoss = useAppStore((state) => state.processMonthlyBoss)
  const hasEmbers = useAppStore((state) =>
    state.purchasedFlourishes.includes('ember_drift'),
  )

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--glow',
      themeById(equippedTheme).glow,
    )
  }, [equippedTheme])

  useEffect(() => {
    processMonthlyBoss()
  }, [processMonthlyBoss])

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {hasEmbers && <AmbientEmbers />}

      <Header />

      <main className="relative z-1 flex-1 px-5 pb-32 pt-6">
        {tab === 'home' && (
          <>
            <DailyCheckins />
            <QuestSection />
          </>
        )}
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'codex' && <CodexTab />}
        {tab === 'character' && <CharacterTab />}
      </main>

      <CelebrationToasts />
      <TabBar active={tab} onChange={setTab} />
      <BossRecapModal />
    </div>
  )
}
