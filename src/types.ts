export type Exchange = 'NSE_CM' | 'NSE_FO' | 'BSE_CM' | 'BSE_FO' | 'MCX'

export const EXCHANGES: Exchange[] = ['NSE_CM', 'NSE_FO', 'BSE_CM', 'BSE_FO', 'MCX']

export interface DepthLevel {
  price: number
  qty: number
}

export interface Depth {
  bid: DepthLevel[]
  ask: DepthLevel[]
}

export interface Quote {
  type: 'quote'
  timestamp: string
  token: number
  ltp: number
  ltq: number
  day_open: number
  day_high: number
  day_low: number
  day_close: number
  vol: number
  oi: number
  depth: Depth
  exchange: Exchange
}

export interface WatchItem {
  exchange: Exchange
  token: number
}

export function watchKey(item: WatchItem): string {
  return `${item.exchange}:${item.token}`
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
