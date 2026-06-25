import { CheckCircle2 } from 'lucide-react'

interface DatasetSummaryBarProps {
  fileName: string | null
  rowCount: number
  featureColumns: string[]
}

// Compact, single-line replacement for the full validation card once
// analysis has completed — the user already saw validation pass; repeating
// the full checklist here adds noise without adding information.
export function DatasetSummaryBar({ fileName, rowCount, featureColumns }: DatasetSummaryBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2.5 text-[12px] text-muted-foreground">
      <CheckCircle2 size={14} className="shrink-0 text-success" aria-hidden="true" />
      <span className="font-medium text-foreground">{fileName ?? 'Dataset'}</span>
      <span aria-hidden="true">·</span>
      <span>{rowCount.toLocaleString()} leads</span>
      <span aria-hidden="true">·</span>
      <span>
        {featureColumns.length} column{featureColumns.length !== 1 ? 's' : ''} analyzed:{' '}
        <span className="text-foreground">{featureColumns.join(', ')}</span>
      </span>
    </div>
  )
}
