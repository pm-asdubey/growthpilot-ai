import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ValidationCheck } from '@/types/validation'

interface ValidationChecklistProps {
  checks: ValidationCheck[]
}

export function ValidationChecklist({ checks }: ValidationChecklistProps) {
  return (
    <ul role="list" aria-label="Validation checks" className="space-y-2">
      {checks.map((check) => (
        <li key={check.label} className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0" aria-hidden="true">
            {check.status === 'pending' && (
              <Circle size={16} className="text-muted-foreground" />
            )}
            {check.status === 'pass' && (
              <CheckCircle size={16} className="text-success" />
            )}
            {check.status === 'fail' && (
              <XCircle size={16} className="text-error" />
            )}
          </span>
          <span
            className={cn(
              'text-[13px] leading-relaxed',
              check.status === 'pass' && 'text-foreground',
              check.status === 'fail' && 'text-error',
              check.status === 'pending' && 'text-muted-foreground',
            )}
          >
            {check.label}
            {check.message && (
              <span className="ml-1 text-muted-foreground">— {check.message}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

// Skeleton shown while parsing / validating
export function ValidationChecklistSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-live="polite" aria-label="Validating file…">
      <Loader2 size={16} className="animate-spin text-primary" aria-hidden="true" />
      <span className="text-[13px] text-muted-foreground">Validating your dataset…</span>
    </div>
  )
}
