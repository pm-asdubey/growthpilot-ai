import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLOURS } from './chartTheme'
import { ChartCard } from './ChartCard'
import type { LeadScoreHistogramData } from '@/types/chart'

interface Props {
  data: LeadScoreHistogramData[]
  sqlThreshold: number
  mqlThreshold: number
}

export function LeadScoreHistogram({ data, sqlThreshold, mqlThreshold }: Props) {
  const getBucketColour = (bucket: string): string => {
    const low = parseInt(bucket.split('–')[0] ?? '0', 10)
    if (low >= sqlThreshold) return CHART_COLOURS.blue
    if (low >= mqlThreshold) return CHART_COLOURS.amber
    return CHART_COLOURS.slate
  }

  // Embed fill per data item — the modern Recharts approach (Cell is deprecated).
  const chartData = data.map((d) => ({ ...d, fill: getBucketColour(d.bucket) }))

  return (
    <ChartCard
      title="Lead Score Distribution"
      description="How scores are spread across your dataset"
      formula={[
        'Each feature value is min-max normalized to 0–1 across the dataset.',
        'Score = Σ (normalized_value × feature_importance_weight) × 100',
        'Result is clamped to 0–100 and rounded to the nearest integer.',
        'Every lead is scored, including already-converted ones — colour bands are an approximate guide.',
        'Exact SQL/MQL/Nurture thresholds (shown in Lead Prioritization) apply only to open, not-yet-converted leads.',
      ]}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 0, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLOURS.border} />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 10, fill: CHART_COLOURS.textMuted }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLOURS.textMuted }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: CHART_COLOURS.muted }}
            formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : String(value ?? ''), 'Leads']}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={400} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <LegendDot colour={CHART_COLOURS.blue} label="SQL" />
        <LegendDot colour={CHART_COLOURS.amber} label="MQL" />
        <LegendDot colour={CHART_COLOURS.slate} label="Nurture" />
      </div>
    </ChartCard>
  )
}

function LegendDot({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colour }} />
      {label}
    </span>
  )
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: '8px',
  border: `1px solid ${CHART_COLOURS.border}`,
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}
