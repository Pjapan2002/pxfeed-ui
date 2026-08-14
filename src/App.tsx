import { useState } from 'react'
import { useFeedStore } from './store/useFeedStore'
import { ConnectionBar } from './components/ConnectionBar'
import { SubscribeForm } from './components/SubscribeForm'
import { WatchlistPanel } from './components/WatchlistPanel'
import { TickerStrip } from './components/TickerStrip'
import { DepthLadder } from './components/DepthLadder'
import { PriceChart } from './components/PriceChart'

export default function App() {
  const activeKey = useFeedStore((s) => s.activeKey)
  const quote = useFeedStore((s) => (activeKey ? s.quotes[activeKey] : undefined))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <h1>pxfeed</h1>
          <ConnectionBar />
        </div>
        <div className="app-header-row">
          <SubscribeForm />
        </div>
      </header>
      <div className="app-body">
        <aside className={`app-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <WatchlistPanel />
        </aside>
        <button
          className="sidebar-edge-toggle"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? '<<' : '>>'}
        </button>
        <main className="app-main">
          <TickerStrip quote={quote} />
          <div className="app-main-content">
            <PriceChart activeKey={activeKey} />
            <DepthLadder depth={quote?.depth} />
          </div>
        </main>
      </div>
    </div>
  )
}
