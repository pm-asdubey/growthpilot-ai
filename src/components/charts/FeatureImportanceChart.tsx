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
import type { FeatureImportanceChartData } from '@/types/chart'

interface Props {
  data: FeatureImportanceChartData[]
}

export function FeatureImportanceChart({ data }: Props) {
  // Embed fill per data item — the modern Recharts approach (Cell is deprecated).
  const chartData = data.map((d, i) => ({
    ...d,
    fill: i === 0 ? CHART_COLOURS.blue : CHART_COLOURS.blueLight,
    fillOpacity: Math.max(0.3, 1 - i * 0.08),
  }))

  return (
    <ChartCard
      title="Feature Importance"
      description="Which signals most strongly predict conversion"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke={CHART_COLOURS.border}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v: number) => `${String(v)}%`}
            tick={{ fontSize: 11, fill: CHART_COLOURS.textMuted }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={148}
            tick={{ fontSize: 12, fill: CHART_COLOURS.text }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: CHART_COLOURS.muted }}
            formatter={(value) => [`${String(value ?? '')}%`, 'Importance']}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={400} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: '8px',
  border: `1px solid ${CHART_COLOURS.border}`,
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}
