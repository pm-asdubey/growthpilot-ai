import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { CHART_COLOURS } from './chartTheme'
import { ChartCard } from './ChartCard'
import type { ConversionTrendData } from '@/types/chart'

interface Props {
  data: ConversionTrendData[]
  conversionRate: number
}

export function ConversionTrendChart({ data, conversionRate }: Props) {
  return (
    <ChartCard
      title="Conversion by Days Since Signup"
      description={`Overall conversion rate: ${String(conversionRate)}%`}
      formula={[
        'Leads are grouped into 30-day buckets by their days_since_signup value.',
        'Each bar shows converted (green) vs not-converted (grey) counts within that bucket.',
        'Conversion Rate = (converted ÷ total in bucket) × 100',
        'Useful for identifying the optimal engagement window after signup.',
      ]}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 8, bottom: 0, left: -8 }}>
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
            formatter={(value, name) => [
              typeof value === 'number' ? value.toLocaleString() : String(value ?? ''),
              name === 'converted' ? 'Converted' : 'Not Converted',
            ]}
            contentStyle={tooltipStyle}
          />
          <Legend
            formatter={(value: string) =>
              value === 'converted' ? 'Converted' : 'Not Converted'
            }
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Bar
            dataKey="converted"
            stackId="a"
            fill={CHART_COLOURS.green}
            radius={[0, 0, 0, 0]}
            isAnimationActive
            animationDuration={400}
          />
          <Bar
            dataKey="notConverted"
            stackId="a"
            fill={CHART_COLOURS.border}
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={400}
          />
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
