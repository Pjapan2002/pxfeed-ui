import type { WatchItem } from '../types'

const WATCHLIST_KEY = 'pxfeed.watchlist'
const WS_URL_KEY = 'pxfeed.wsUrl'

export function loadWatchlist(): WatchItem[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveWatchlist(items: WatchItem[]): void {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items))
}

export function loadWsUrl(fallback: string): string {
  return localStorage.getItem(WS_URL_KEY) ?? fallback
}

export function saveWsUrl(url: string): void {
  localStorage.setItem(WS_URL_KEY, url)
}
