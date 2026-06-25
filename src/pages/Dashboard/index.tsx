import { useState } from 'react'
import {
  BarChart3, CheckCircle, Clock, GitMerge, Share2, TrendingUp, Users, Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ComingSoonCard } from '@/components/common/ComingSoonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/common/MetricCard'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { loadPersistedHistory } from '@/hooks/usePersistedAnalysis'
import { fmtPercent, fmtRelativeTime } from '@/utils/formatting'
import type { PersistedAnalysis } from '@/types/persistence'

const COMING_SOON_MODULES = [
  { icon: GitMerge, moduleName: 'Funnel Analysis', description: 'Visualise drop-off at every stage of your acquisition funnel.' },
  { icon: Share2, moduleName: 'Attribution Analysis', description: 'Understand which channels drive conversion across all touchpoints.' },
  { icon: Users, moduleName: 'Segmentation', description: 'Automatically cluster your customer base by firmographic and behavioural attributes.' },
  { icon: BarChart3, moduleName: 'Churn Prediction', description: 'Identify at-risk accounts before they churn using usage signals.' },
]

const PLACEHOLDER_KPIS = [
  { title: 'Total Leads', value: '—', icon: Users, trend: undefined },
  { title: 'Converted Leads', value: '—', icon: CheckCircle, trend: undefined },
  { title: 'Conversion Rate', value: '—', icon: TrendingUp, trend: undefined },
  { title: 'SQL Count', value: '—', icon: Zap, trend: undefined },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const [history] = useState<PersistedAnalysis[]>(() => loadPersistedHistory())
  const latest = history.at(0) ?? null

  const kpis = latest
    ? [
        { title: 'Total Leads', value: latest.kpis.totalLeads.toLocaleString(), icon: Users, trend: undefined },
        { title: 'Converted Leads', value: latest.kpis.convertedLeads.toLocaleString(), icon: CheckCircle, trend: undefined },
        { title: 'Conversion Rate', value: fmtPercent(latest.kpis.conversionRate), icon: TrendingUp, trend: undefined },
        { title: 'SQL Count', value: latest.kpis.sqlCount.toLocaleString(), icon: Zap, trend: undefined },
      ]
    : PLACEHOLDER_KPIS

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <PageHeader
        title="Welcome back"
        description={
          latest
            ? `Last analysis: ${latest.fileName} · ${latest.rowCount.toLocaleString()} leads`
            : 'Upload a lead dataset on the Lead Intelligence page to get started.'
        }
      />

      {/* KPI grid */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <MetricCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} trend={kpi.trend} />
          ))}
        </div>
        {!latest && (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Showing placeholder data — run your first analysis to see real numbers.
          </p>
        )}
      </section>

      {/* Analysis history */}
      <SectionCard
        title="Recent Analyses"
        description={history.length > 0 ? `${String(history.length)} saved analysis${history.length !== 1 ? 'es' : ''} — click any to view` : undefined}
      >
        {history.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No analysis yet"
            description="Upload your first historical lead dataset to begin."
            action={{ label: 'Upload Historical Dataset', onClick: () => { void navigate('/lead-intelligence') } }}
          />
        ) : (
          <div className="space-y-2">
            {history.map((entry, i) => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                isLatest={i === 0}
                onClick={() => { void navigate(`/lead-intelligence?id=${entry.id}`) }}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Coming soon */}
      <section aria-labelledby="coming-soon-heading">
        <div className="mb-4 space-y-1">
          <h2 id="coming-soon-heading" className="text-[18px] font-semibold text-foreground">More modules coming soon</h2>
          <p className="text-[13px] text-muted-foreground">GrowthPilot AI is expanding. These analytics modules are in development.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COMING_SOON_MODULES.map((mod) => (
            <ComingSoonCard key={mod.moduleName} icon={mod.icon} moduleName={mod.moduleName} description={mod.description} />
          ))}
        </div>
      </section>
    </div>
  )
}

function HistoryRow({ entry, isLatest, onClick }: { entry: PersistedAnalysis; isLatest: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[10px] border border-border bg-background px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Icon */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <TrendingUp size={16} aria-hidden="true" />
      </span>

      {/* File + date */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-foreground">{entry.fileName}</p>
          {isLatest && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Latest</span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {entry.rowCount.toLocaleString()} leads · {fmtRelativeTime(entry.analyzedAt)}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden shrink-0 items-center gap-4 sm:flex">
        <Stat label="Conv." value={fmtPercent(entry.kpis.conversionRate)} />
        <Stat label="SQL" value={entry.kpis.sqlCount.toLocaleString()} />
        <Stat label="MQL" value={entry.kpis.mqlCount.toLocaleString()} />
      </div>

      {/* Time */}
      <div className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
        <Clock size={11} aria-hidden="true" />
        {fmtRelativeTime(entry.analyzedAt)}
      </div>
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-[13px] font-semibold text-foreground">{value}</p>
    </div>
  )
}
