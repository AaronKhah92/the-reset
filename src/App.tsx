import { useState } from 'react'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import type { TabKey } from './components/TabBar'
import { CelebrationToasts } from './components/ui/CelebrationToasts'
import { CalendarTab } from './features/calendar/CalendarTab'
import { CharacterTab } from './features/character/CharacterTab'
import { DailyCheckins } from './features/checkins/DailyCheckins'
import { QuestSection } from './features/quests/QuestSection'

export default function App() {
  const [tab, setTab] = useState<TabKey>('home')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <Header />

      <main className="flex-1 px-5 pb-32 pt-6">
        {tab === 'home' && (
          <>
            <DailyCheckins />
            <QuestSection />
          </>
        )}
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'character' && <CharacterTab />}
      </main>

      <CelebrationToasts />
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
