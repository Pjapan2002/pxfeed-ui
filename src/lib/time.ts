// Server sends "YYYY-MM-DD HH:mm:ss" with no timezone; treated as local time.
export function parseTimestamp(ts: string): number {
  const iso = ts.includes('T') ? ts : ts.replace(' ', 'T')
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000)
}

// lightweight-charts always renders UTCTimestamp values using UTC clock methods.
// Shifting by the local offset makes it display local wall-clock time instead.
const LOCAL_OFFSET_SECONDS = -new Date().getTimezoneOffset() * 60

export function toChartTime(epochSeconds: number): number {
  return epochSeconds + LOCAL_OFFSET_SECONDS
}
