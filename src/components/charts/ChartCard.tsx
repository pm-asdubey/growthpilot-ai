import { cn } from '@/lib/utils'
import { FormulaTooltip } from '@/components/common/FormulaTooltip'

interface ChartCardProps {
  title: string
  description?: string
  formula?: string[]   // Lines shown in the formula tooltip
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, formula, children, className }: ChartCardProps) {
  return (
    <div className={cn('rounded-[12px] border border-border bg-card p-6', className)}>
      <div className="mb-4 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {formula && <FormulaTooltip title={title} lines={formula} />}
        </div>
        {description && (
          <p className="text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
