import { useState } from 'react'
import { useFeedStore } from '../store/useFeedStore'
import { EXCHANGES, type Exchange } from '../types'

export function SubscribeForm() {
  const addSymbol = useFeedStore((s) => s.addSymbol)

  const [exchange, setExchange] = useState<Exchange>('NSE_CM')
  const [tokenInput, setTokenInput] = useState('')

  function handleAdd() {
    const token = Number(tokenInput.trim())
    if (!Number.isInteger(token) || token <= 0) return
    addSymbol({ exchange, token })
    setTokenInput('')
  }

  return (
    <div className="subscribe-form">
      <select value={exchange} onChange={(e) => setExchange(e.target.value as Exchange)}>
        {EXCHANGES.map((ex) => (
          <option key={ex} value={ex}>
            {ex}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Token"
        value={tokenInput}
        onChange={(e) => setTokenInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button className="btn btn-primary" onClick={handleAdd}>
        Subscribe
      </button>
    </div>
  )
}
