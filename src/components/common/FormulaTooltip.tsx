import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormulaTooltipProps {
  title: string
  lines: string[]
  className?: string
}

export function FormulaTooltip({ title, lines, className }: FormulaTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={`How ${title} is calculated`}
        aria-expanded={open}
        onClick={() => { setOpen((o) => !o) }}
        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info size={14} aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => { setOpen(false) }} />

          {/* Popover */}
          <div
            role="tooltip"
            className="absolute left-6 top-0 z-50 w-72 rounded-[10px] border border-border bg-card p-4 shadow-lg"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-[12px] font-semibold text-foreground">{title}</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => { setOpen(false) }}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none"
              >
                <X size={12} />
              </button>
            </div>
            <ul className="space-y-1.5">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{line}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
