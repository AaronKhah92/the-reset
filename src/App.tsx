import { Header } from './components/Header'
import { CelebrationToasts } from './components/ui/CelebrationToasts'
import { DailyCheckins } from './features/checkins/DailyCheckins'

export default function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <Header />

      <main className="flex-1 px-5 pb-32 pt-6">
        <DailyCheckins />
      </main>

      <CelebrationToasts />
    </div>
  )
}
