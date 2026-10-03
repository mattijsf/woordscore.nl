import { Fragment, useRef } from "react"
import { useWidth } from "../../hooks/useWidth.ts"
import { nf } from "../../lib/format.ts"
import { useColors } from "../../store/useBoardStore.ts"
import type { Period } from "../../types/board.ts"

const MARGIN = { l: 30, r: 12, t: 16, b: 38 }

interface TrendChartProps {
  period: Period
  focus: string | null
}

/** The monthly average of every player as a line; the focused player on top, with values. */
export function TrendChart({ period: P, focus }: TrendChartProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const W = Math.max(useWidth(ref), 280)
  return (
    <div id="chart" ref={ref}>
      <Lines period={P} focus={focus} width={W} />
    </div>
  )
}

function Lines({
  period: P,
  focus,
  width: W,
}: TrendChartProps & { width: number }): React.ReactNode {
  const COLORS = useColors()
  const H = Math.round(Math.min(Math.max(W * 0.6, 230), 340))
  const m = MARGIN
  const pw = W - m.l - m.r
  const ph = H - m.t - m.b
  const trends = Object.entries(P.trend)
  const idx = P.months.map((_, i) => i).filter(i => trends.some(([, t]) => t[i] != null))
  const all = trends.flatMap(([, t]) => t).filter(v => v != null)
  if (!all.length) {
    return null
  }
  const lo = Math.floor(Math.min(...all) * 2) / 2
  const hi = Math.max(Math.ceil(Math.max(...all) * 2) / 2, lo + 0.5)
  const x = (i: number): number =>
    m.l + (idx.length > 1 ? idx.indexOf(i) / (idx.length - 1) : 0.5) * pw
  const y = (v: number): number => m.t + ((hi - v) / (hi - lo)) * ph
  const levels: number[] = []
  for (let v = lo; v <= hi + 1e-9; v += 0.5) {
    levels.push(v)
  }
  const step = pw / Math.max(idx.length - 1, 1) < 34 ? 2 : 1
  const order = trends.toSorted(([a], [b]) => Number(a === focus) - Number(b === focus))
  const points = (t: (number | null)[]): [number, number][] =>
    idx.flatMap(i => {
      const v = t[i]
      return v == null ? [] : [[i, v] as [number, number]]
    })
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Lijngrafiek van het maandgemiddelde per speler"
    >
      {levels.map(v => (
        <Fragment key={v}>
          <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={m.l - 6} y={y(v) + 4} textAnchor="end">
            {nf(v, 1)}
          </text>
        </Fragment>
      ))}
      {idx.map((i, k) => {
        if (k % step) {
          return null
        }
        const [mo = "", yr = ""] = (P.months[i] ?? "").split(" ")
        return (
          <Fragment key={i}>
            <text x={x(i)} y={H - m.b + 16} textAnchor="middle">
              {mo}
            </text>
            {k === 0 || mo === "jan" ? (
              <text x={x(i)} y={H - m.b + 30} textAnchor="middle">
                20{yr.slice(1)}
              </text>
            ) : null}
          </Fragment>
        )
      })}
      {order.map(([name, t]) => {
        const focused = focus === name
        let d = ""
        let pen = false
        for (const i of idx) {
          const v = t[i]
          if (v == null) {
            pen = false
            continue
          }
          d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`
          pen = true
        }
        return (
          <Fragment key={name}>
            <g opacity={!focus || focused ? 1 : 0.16}>
              <path
                d={d}
                fill="none"
                stroke={COLORS[name]}
                strokeWidth={focused ? 3.2 : 2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points(t).map(([i, v]) => (
                <circle
                  key={i}
                  cx={x(i).toFixed(1)}
                  cy={y(v).toFixed(1)}
                  r={focused ? 4 : 3}
                  fill={COLORS[name]}
                />
              ))}
            </g>
            {focused
              ? points(t).map(([i, v]) => (
                  <text
                    key={i}
                    className="val"
                    x={x(i).toFixed(1)}
                    y={(y(v) - 9).toFixed(1)}
                    textAnchor="middle"
                  >
                    {nf(v, 1)}
                  </text>
                ))
              : null}
          </Fragment>
        )
      })}
    </svg>
  )
}
