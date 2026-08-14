import { useState } from 'react'
import { useFeedStore } from '../store/useFeedStore'

const STATUS_LABEL: Record<string, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting…',
  connected: 'Connected',
  error: 'Error',
}

export function ConnectionBar() {
  const wsUrl = useFeedStore((s) => s.wsUrl)
  const status = useFeedStore((s) => s.status)
  const lastError = useFeedStore((s) => s.lastError)
  const setWsUrl = useFeedStore((s) => s.setWsUrl)
  const connect = useFeedStore((s) => s.connect)
  const disconnect = useFeedStore((s) => s.disconnect)

  const [draftUrl, setDraftUrl] = useState(wsUrl)

  const isConnected = status === 'connected' || status === 'connecting'

  return (
    <div className="connection-bar">
      <span className={`status-dot status-${status}`} />
      <span className="status-label">{STATUS_LABEL[status]}</span>
      <input
        className="ws-url-input"
        value={draftUrl}
        onChange={(e) => setDraftUrl(e.target.value)}
        placeholder="ws://host:8080/ws"
        disabled={isConnected}
      />
      {isConnected ? (
        <button className="btn btn-secondary" onClick={disconnect}>
          Disconnect
        </button>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => {
            setWsUrl(draftUrl)
            connect()
          }}
        >
          Connect
        </button>
      )}
      {lastError && status === 'error' && <span className="error-text">{lastError}</span>}
    </div>
  )
}
