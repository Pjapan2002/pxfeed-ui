import { create } from 'zustand'
import type { ConnectionStatus, Quote, WatchItem } from '../types'
import { watchKey } from '../types'
import { parseTimestamp } from '../lib/time'
import { loadWatchlist, loadWsUrl, saveWatchlist, saveWsUrl } from '../lib/storage'

export interface Tick {
  time: number // epoch seconds
  price: number
  qty: number
}

const MAX_TICKS_PER_SYMBOL = 5000
const RECONNECT_DELAY_MS = 2000

interface FeedState {
  wsUrl: string
  status: ConnectionStatus
  lastError: string | null
  watchlist: WatchItem[]
  activeKey: string | null
  quotes: Record<string, Quote>
  ticks: Record<string, Tick[]>

  setWsUrl: (url: string) => void
  connect: () => void
  disconnect: () => void
  addSymbol: (item: WatchItem) => void
  removeSymbol: (item: WatchItem) => void
  setActiveKey: (key: string) => void
}

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let manualDisconnect = false

function send(action: 'subscribe' | 'unsubscribe', item: WatchItem) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify({ action, exchange: item.exchange, tokens: [item.token] }))
}

export const useFeedStore = create<FeedState>((set, get) => ({
  wsUrl: loadWsUrl('ws://localhost:8080/ws'),
  status: 'disconnected',
  lastError: null,
  watchlist: loadWatchlist(),
  activeKey: null,
  quotes: {},
  ticks: {},

  setWsUrl: (url) => {
    saveWsUrl(url)
    set({ wsUrl: url })
  },

  connect: () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return
    }
    manualDisconnect = false
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    const url = get().wsUrl
    set({ status: 'connecting', lastError: null })

    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch (err) {
      set({ status: 'error', lastError: err instanceof Error ? err.message : 'Failed to connect' })
      return
    }
    socket = ws

    ws.onopen = () => {
      set({ status: 'connected', lastError: null })
      for (const item of get().watchlist) send('subscribe', item)
    }

    ws.onmessage = (event) => {
      let payload: unknown
      try {
        payload = JSON.parse(event.data)
      } catch {
        return
      }
      const items = Array.isArray(payload) ? payload : [payload]
      const quotes = { ...get().quotes }
      const ticks = { ...get().ticks }

      for (const raw of items) {
        const q = raw as Quote
        if (!q || q.type !== 'quote') continue
        const key = watchKey({ exchange: q.exchange, token: q.token })
        quotes[key] = q

        const prev = ticks[key] ?? []
        const next = [...prev, { time: parseTimestamp(q.timestamp), price: q.ltp, qty: q.ltq }]
        ticks[key] = next.length > MAX_TICKS_PER_SYMBOL ? next.slice(next.length - MAX_TICKS_PER_SYMBOL) : next
      }

      set({ quotes, ticks })
    }

    ws.onerror = () => {
      set({ status: 'error', lastError: 'WebSocket error' })
    }

    ws.onclose = () => {
      socket = null
      if (manualDisconnect) {
        set({ status: 'disconnected' })
        return
      }
      set({ status: 'error', lastError: 'Disconnected, retrying…' })
      reconnectTimer = setTimeout(() => get().connect(), RECONNECT_DELAY_MS)
    }
  },

  disconnect: () => {
    manualDisconnect = true
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    socket?.close()
    socket = null
    set({ status: 'disconnected' })
  },

  addSymbol: (item) => {
    const key = watchKey(item)
    const existing = get().watchlist
    if (existing.some((w) => watchKey(w) === key)) return
    const next = [...existing, item]
    set({ watchlist: next, activeKey: get().activeKey ?? key })
    saveWatchlist(next)
    send('subscribe', item)
  },

  removeSymbol: (item) => {
    const key = watchKey(item)
    const next = get().watchlist.filter((w) => watchKey(w) !== key)
    set((state) => {
      const quotes = { ...state.quotes }
      const ticks = { ...state.ticks }
      delete quotes[key]
      delete ticks[key]
      return {
        watchlist: next,
        quotes,
        ticks,
        activeKey: state.activeKey === key ? (next[0] ? watchKey(next[0]) : null) : state.activeKey,
      }
    })
    saveWatchlist(next)
    send('unsubscribe', item)
  },

  setActiveKey: (key) => set({ activeKey: key }),
}))
