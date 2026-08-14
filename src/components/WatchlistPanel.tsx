import { useFeedStore } from '../store/useFeedStore'
import { watchKey } from '../types'

export function WatchlistPanel() {
  const watchlist = useFeedStore((s) => s.watchlist)
  const activeKey = useFeedStore((s) => s.activeKey)
  const quotes = useFeedStore((s) => s.quotes)
  const removeSymbol = useFeedStore((s) => s.removeSymbol)
  const setActiveKey = useFeedStore((s) => s.setActiveKey)

  return (
    <div className="watchlist-panel">
      <div className="watchlist-list">
        {watchlist.length === 0 && <div className="watchlist-empty">No symbols yet. Subscribe a token above.</div>}
        {watchlist.map((item) => {
          const key = watchKey(item)
          const quote = quotes[key]
          return (
            <div
              key={key}
              className={`watchlist-row ${key === activeKey ? 'active' : ''}`}
              onClick={() => setActiveKey(key)}
            >
              <div className="watchlist-row-main">
                <span className="watchlist-token">{item.token}</span>
                <span className="watchlist-exchange">{item.exchange}</span>
              </div>
              <div className="watchlist-row-price">
                {quote ? quote.ltp.toFixed(2) : '—'}
              </div>
              <button
                className="btn-icon"
                title="Unsubscribe"
                onClick={(e) => {
                  e.stopPropagation()
                  removeSymbol(item)
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
