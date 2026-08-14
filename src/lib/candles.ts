import type { Tick } from '../store/useFeedStore'

export interface Bar {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export function bucketFor(time: number, intervalSec: number): number {
  return Math.floor(time / intervalSec) * intervalSec
}

export function aggregateCandles(ticks: Tick[], intervalSec: number): Bar[] {
  const bars: Bar[] = []
  let current: Bar | null = null

  for (const t of ticks) {
    const bucket = bucketFor(t.time, intervalSec)
    if (!current || current.time !== bucket) {
      if (current) bars.push(current)
      current = { time: bucket, open: t.price, high: t.price, low: t.price, close: t.price }
    } else {
      current.high = Math.max(current.high, t.price)
      current.low = Math.min(current.low, t.price)
      current.close = t.price
    }
  }
  if (current) bars.push(current)
  return bars
}
