import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ValidationError } from '@/types/validation'

interface ValidationErrorPanelProps {
  errors: ValidationError[]
  fileName: string
  onReset: () => void
}

export function ValidationErrorPanel({ errors, fileName, onReset }: ValidationErrorPanelProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-[12px] border border-error/30 bg-error/5 p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-error"
          aria-hidden="true"
        />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[15px] font-semibold text-foreground">
              Validation failed
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              <span className="font-medium">{fileName}</span> contains{' '}
              {errors.length === 1 ? '1 issue' : `${String(errors.length)} issues`} that must be
              resolved before analysis can begin.
            </p>
          </div>

          <ul role="list" className="space-y-2">
            {errors.map((err, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-error" aria-hidden="true" />
                <p className="text-[13px] text-foreground">{err.message}</p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Try a different file
          </button>
        </div>
      </div>
    </div>
  )
}
