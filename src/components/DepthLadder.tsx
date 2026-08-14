import type { Depth } from '../types'

function fmt(n: number): string {
  return n.toFixed(2)
}

export function DepthLadder({ depth }: { depth: Depth | undefined }) {
  const bids = depth?.bid ?? []
  const asks = depth?.ask ?? []
  const rows = Math.max(bids.length, asks.length, 5)
  const maxQty = Math.max(1, ...bids.map((b) => b.qty), ...asks.map((a) => a.qty))

  return (
    <div className="depth-ladder">
      <div className="depth-header">
        <span>Qty</span>
        <span>Bid</span>
        <span>Ask</span>
        <span>Qty</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => {
        const bid = bids[i]
        const ask = asks[i]
        return (
          <div className="depth-row" key={i}>
            <span className="depth-qty">{bid ? bid.qty : ''}</span>
            <span
              className="depth-bid"
              style={bid ? { background: `linear-gradient(to left, rgba(38,166,91,0.18) ${(bid.qty / maxQty) * 100}%, transparent 0)` } : undefined}
            >
              {bid ? fmt(bid.price) : ''}
            </span>
            <span
              className="depth-ask"
              style={ask ? { background: `linear-gradient(to right, rgba(220,73,69,0.18) ${(ask.qty / maxQty) * 100}%, transparent 0)` } : undefined}
            >
              {ask ? fmt(ask.price) : ''}
            </span>
            <span className="depth-qty">{ask ? ask.qty : ''}</span>
          </div>
        )
      })}
    </div>
  )
}
