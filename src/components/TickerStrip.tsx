import type { Quote } from '../types'

function fmt(n: number | undefined, digits = 2): string {
  return n === undefined ? '—' : n.toFixed(digits)
}

export function TickerStrip({ quote }: { quote: Quote | undefined }) {
  if (!quote) {
    return <div className="ticker-strip ticker-empty">Waiting for data…</div>
  }

  const change = quote.ltp - quote.day_close
  const pct = quote.day_close ? (change / quote.day_close) * 100 : 0
  const changeClass = change > 0 ? 'up' : change < 0 ? 'down' : ''

  return (
    <div className="ticker-strip">
      <div className="ticker-primary">
        <span className="ticker-token">{quote.token}</span>
        <span className="ticker-exchange">{quote.exchange}</span>
        <span className="ticker-ltp">{fmt(quote.ltp)}</span>
        <span className={`ticker-change ${changeClass}`}>
          {change >= 0 ? '+' : ''}
          {fmt(change)} ({pct >= 0 ? '+' : ''}
          {fmt(pct)}%)
        </span>
      </div>
      <div className="ticker-fields">
        <span>LTQ <b>{quote.ltq}</b></span>
        <span>Open <b>{fmt(quote.day_open)}</b></span>
        <span>High <b>{fmt(quote.day_high)}</b></span>
        <span>Low <b>{fmt(quote.day_low)}</b></span>
        <span>Close <b>{fmt(quote.day_close)}</b></span>
        <span>Vol <b>{quote.vol.toLocaleString()}</b></span>
        <span>OI <b>{quote.oi.toLocaleString()}</b></span>
        <span className="ticker-timestamp">{quote.timestamp}</span>
      </div>
    </div>
  )
}
