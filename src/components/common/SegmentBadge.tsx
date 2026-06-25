import { cn } from '@/lib/utils'

interface SegmentBadgeProps {
  label: string
  subtitle: string
  count: number
  total: number
  threshold?: number
  variant: 'sql' | 'mql' | 'nurture'
}

const VARIANT_STYLES: Record<SegmentBadgeProps['variant'], string> = {
  sql:     'border-primary/20 bg-primary/5 text-primary',
  mql:     'border-warning/20 bg-warning/5 text-warning',
  nurture: 'border-border bg-muted text-muted-foreground',
}

export function SegmentBadge({ label, subtitle, count, total, threshold, variant }: SegmentBadgeProps) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div className={cn('rounded-[12px] border p-5', VARIANT_STYLES[variant])}>
      <p className="text-[12px] font-semibold uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-[11px] opacity-70">{subtitle}</p>
      <p className="mt-3 text-[32px] font-bold leading-none">{count.toLocaleString()}</p>
      <p className="mt-1.5 text-[12px] opacity-70">
        {pct}% of total
        {threshold !== undefined && threshold > 0 && <> · score ≥ {threshold}</>}
      </p>
    </div>
  )
}
