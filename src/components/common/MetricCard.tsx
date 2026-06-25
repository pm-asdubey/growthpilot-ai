import { TrendingDown, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trend {
  direction: 'up' | 'down' | 'neutral'
  label: string
}

interface MetricCardProps {
  title: string
  value: string
  trend?: Trend
  icon?: LucideIcon
  className?: string
}

export function MetricCard({ title, value, trend, icon: Icon, className }: MetricCardProps) {
  const trendColour =
    trend?.direction === 'up'
      ? 'text-success'
      : trend?.direction === 'down'
        ? 'text-error'
        : 'text-muted-foreground'

  return (
    <div
      className={cn(
        'group rounded-[12px] border border-border bg-card p-6',
        'transition-shadow duration-150 hover:shadow-md',
        className,
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="mt-2 text-[32px] font-bold leading-none tracking-tight text-foreground">
        {value}
      </p>

      {trend && (
        <div className={cn('mt-3 flex items-center gap-1 text-[13px] font-medium', trendColour)}>
          {trend.direction === 'up' && <TrendingUp size={14} aria-hidden="true" />}
          {trend.direction === 'down' && <TrendingDown size={14} aria-hidden="true" />}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
