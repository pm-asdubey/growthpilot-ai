import { cn } from '@/lib/utils'

interface SectionCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-border bg-card p-6 shadow-sm',
        className,
      )}
    >
      {(title ?? description) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h2 className="text-[18px] font-semibold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-[13px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
