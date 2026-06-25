import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComingSoonCardProps {
  icon?: LucideIcon
  moduleName: string
  description: string
  className?: string
}

export function ComingSoonCard({
  icon: Icon,
  moduleName,
  description,
  className,
}: ComingSoonCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[12px] border border-border bg-card p-6',
        'opacity-70 transition-opacity duration-150 hover:opacity-90',
        className,
      )}
      aria-label={`${moduleName} — coming soon`}
    >
      {/* Subtle top-right badge */}
      <span className="absolute right-4 top-4 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Coming Soon
      </span>

      {Icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon size={20} aria-hidden="true" />
        </span>
      )}

      <p className="text-[15px] font-semibold text-foreground">{moduleName}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>

      <p className="mt-4 text-[12px] font-medium text-muted-foreground">
        Available in a future release
      </p>
    </div>
  )
}
