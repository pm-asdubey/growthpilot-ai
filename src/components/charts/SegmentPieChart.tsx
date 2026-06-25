import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CHART_COLOURS, SEGMENT_COLOURS } from './chartTheme'
import { ChartCard } from './ChartCard'
import type { SegmentDistributionData } from '@/types/chart'

interface Props {
  data: SegmentDistributionData[]
  totalLeads: number
}

export function SegmentPieChart({ data, totalLeads }: Props) {
  // Embed fill per data item — the modern Recharts approach (Cell is deprecated).
  const chartData = data.map((d) => ({
    ...d,
    fill: SEGMENT_COLOURS[d.label] ?? CHART_COLOURS.slate,
  }))

  return (
    <ChartCard
      title="SQL / MQL / Nurture"
      description="Lead segment distribution"
    >
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="80%"
              paddingAngle={2}
              isAnimationActive
              animationDuration={400}
              stroke="transparent"
            />
            <Tooltip
              formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : String(value ?? ''), 'Leads']}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with counts */}
        <div className="shrink-0 space-y-3">
          {data.map((entry) => {
            const pct = totalLeads === 0 ? 0 : Math.round((entry.count / totalLeads) * 100)
            return (
              <div key={entry.label} className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: SEGMENT_COLOURS[entry.label] ?? CHART_COLOURS.slate }}
                />
                <div>
                  <p className="text-[12px] font-semibold text-foreground">{entry.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.count.toLocaleString()} · {pct}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ChartCard>
  )
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: '8px',
  border: `1px solid ${CHART_COLOURS.border}`,
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}
