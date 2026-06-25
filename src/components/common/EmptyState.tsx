import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[12px] border border-dashed border-border bg-card p-12 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={28} aria-hidden="true" />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-[10px] bg-primary px-5 py-2 text-[14px] font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
