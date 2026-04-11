import { Header } from './components/Header'
import { StatsBar } from './components/StatsBar'
import { HatchButton } from './components/HatchButton'
import { InventoryList } from './components/InventoryList'
import { DisplayRooms } from './components/DisplayRooms'
import { ExpandFacility } from './components/ExpandFacility'
import { BottomNav } from './components/BottomNav'

export function App() {
  return (
    <div className="min-h-screen bg-surface-container-lowest max-w-lg mx-auto flex flex-col">
      <Header />
      <main className="flex-grow overflow-y-auto space-y-0">
        <StatsBar />
        <HatchButton />
        <InventoryList />
        <DisplayRooms />
        <ExpandFacility />
      </main>
      <BottomNav />
    </div>
  )
}
