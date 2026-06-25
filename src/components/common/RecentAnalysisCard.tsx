import { ArrowRight, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fmtPercent, fmtRelativeTime } from '@/utils/formatting'
import type { PersistedAnalysis } from '@/types/persistence'

interface RecentAnalysisCardProps {
  analysis: PersistedAnalysis
}

export function RecentAnalysisCard({ analysis }: RecentAnalysisCardProps) {
  const navigate = useNavigate()
  const { kpis, fileName, rowCount, analyzedAt } = analysis

  return (
    <div className="rounded-[12px] border border-border bg-card p-5 transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* File info */}
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-foreground">{fileName}</p>
            <p className="text-[12px] text-muted-foreground">
              {rowCount.toLocaleString()} leads · {fmtRelativeTime(analyzedAt)}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => { void navigate('/lead-intelligence') }}
          aria-label="Go to Lead Intelligence to re-run analysis"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          New analysis
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>

      {/* KPI summary row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPIStat label="Total Leads" value={kpis.totalLeads.toLocaleString()} />
        <KPIStat label="Converted" value={kpis.convertedLeads.toLocaleString()} />
        <KPIStat label="Conv. Rate" value={fmtPercent(kpis.conversionRate)} highlight />
        <KPIStat label="SQL Count" value={kpis.sqlCount.toLocaleString()} />
      </div>
    </div>
  )
}

function KPIStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-[8px] bg-muted px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}
