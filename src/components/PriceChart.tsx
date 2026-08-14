import { useEffect, useRef, useState } from 'react'
import {
  ColorType,
  CrosshairMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type CandlestickData,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useFeedStore, type Tick } from '../store/useFeedStore'
import { aggregateCandles, bucketFor, type Bar } from '../lib/candles'
import { toChartTime } from '../lib/time'

// lightweight-charts' setData() rejects two points sharing the same time (even if
// equal to the previous one), so ticks landing in the same wall-clock second must
// collapse into a single point — keep the latest price, matching update()'s semantics.
function toLineData(ticks: Tick[]): LineData[] {
  const data: LineData[] = []
  for (const t of ticks) {
    const time = toChartTime(t.time) as UTCTimestamp
    const last = data[data.length - 1]
    if (last && last.time === time) {
      last.value = t.price
    } else {
      data.push({ time, value: t.price })
    }
  }
  return data
}

type ChartType = 'line' | 'candle'

const INTERVALS: { label: string; seconds: number }[] = [
  { label: '1s', seconds: 1 },
  { label: '5s', seconds: 5 },
  { label: '15s', seconds: 15 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '15m', seconds: 900 },
]

export function PriceChart({ activeKey }: { activeKey: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const currentBarRef = useRef<Bar | null>(null)

  const [chartType, setChartType] = useState<ChartType>('line')
  const [intervalSec, setIntervalSec] = useState(60)

  // Create chart once.
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1115' },
        textColor: '#c7ccd6',
      },
      grid: {
        vertLines: { color: '#1c1f26' },
        horzLines: { color: '#1c1f26' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: true },
      autoSize: true,
    })
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      lineSeriesRef.current = null
      candleSeriesRef.current = null
    }
  }, [])

  // Swap series type.
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    if (lineSeriesRef.current) {
      chart.removeSeries(lineSeriesRef.current)
      lineSeriesRef.current = null
    }
    if (candleSeriesRef.current) {
      chart.removeSeries(candleSeriesRef.current)
      candleSeriesRef.current = null
    }
    if (chartType === 'line') {
      lineSeriesRef.current = chart.addLineSeries({ color: '#4ea8de', lineWidth: 2 })
    } else {
      candleSeriesRef.current = chart.addCandlestickSeries({
        upColor: '#26a65b',
        downColor: '#dc4945',
        borderVisible: false,
        wickUpColor: '#26a65b',
        wickDownColor: '#dc4945',
      })
    }
  }, [chartType])

  // Rebuild data on symbol / interval / type change.
  useEffect(() => {
    if (!activeKey) return
    const ticks = useFeedStore.getState().ticks[activeKey] ?? []

    if (chartType === 'line' && lineSeriesRef.current) {
      lineSeriesRef.current.setData(toLineData(ticks))
      currentBarRef.current = null
    } else if (chartType === 'candle' && candleSeriesRef.current) {
      const bars = aggregateCandles(ticks, intervalSec)
      const data: CandlestickData[] = bars.map((b) => ({ ...b, time: toChartTime(b.time) as UTCTimestamp }))
      candleSeriesRef.current.setData(data)
      currentBarRef.current = bars[bars.length - 1] ?? null
    }
  }, [activeKey, chartType, intervalSec])

  // Live updates: subscribe to the store outside React render to avoid extra re-renders per tick.
  useEffect(() => {
    if (!activeKey) return
    let lastTickCount = useFeedStore.getState().ticks[activeKey]?.length ?? 0

    function applyTicks(newTicks: Tick[]) {
      if (chartType === 'line' && lineSeriesRef.current) {
        for (const t of newTicks) {
          lineSeriesRef.current.update({ time: toChartTime(t.time) as UTCTimestamp, value: t.price })
        }
      } else if (chartType === 'candle' && candleSeriesRef.current) {
        for (const t of newTicks) {
          const bucket = bucketFor(t.time, intervalSec)
          const prev = currentBarRef.current
          const bar: Bar =
            !prev || prev.time !== bucket
              ? { time: bucket, open: t.price, high: t.price, low: t.price, close: t.price }
              : { ...prev, high: Math.max(prev.high, t.price), low: Math.min(prev.low, t.price), close: t.price }
          currentBarRef.current = bar
          candleSeriesRef.current.update({ ...bar, time: toChartTime(bar.time) as UTCTimestamp })
        }
      }
    }

    const unsub = useFeedStore.subscribe((state) => {
      const ticks = state.ticks[activeKey]
      if (!ticks || ticks.length === lastTickCount) return
      const newTicks = ticks.slice(lastTickCount)
      lastTickCount = ticks.length
      applyTicks(newTicks)
    })
    return unsub
  }, [activeKey, chartType, intervalSec])

  return (
    <div className="price-chart">
      <div className="chart-toolbar">
        <div className="chart-type-toggle">
          <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>
            Line
          </button>
          <button className={chartType === 'candle' ? 'active' : ''} onClick={() => setChartType('candle')}>
            Candles
          </button>
        </div>
        {chartType === 'candle' && (
          <div className="chart-interval-select">
            {INTERVALS.map((iv) => (
              <button
                key={iv.seconds}
                className={intervalSec === iv.seconds ? 'active' : ''}
                onClick={() => setIntervalSec(iv.seconds)}
              >
                {iv.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chart-container" ref={containerRef} />
    </div>
  )
}
