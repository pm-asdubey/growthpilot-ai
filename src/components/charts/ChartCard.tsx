import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div className={cn('rounded-[12px] border border-border bg-card p-6', className)}>
      <div className="mb-4 space-y-0.5">
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
