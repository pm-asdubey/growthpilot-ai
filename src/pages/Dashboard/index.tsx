import { useState } from 'react'
import {
  BarChart3,
  CheckCircle,
  GitMerge,
  Share2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ComingSoonCard } from '@/components/common/ComingSoonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/common/MetricCard'
import { PageHeader } from '@/components/common/PageHeader'
import { RecentAnalysisCard } from '@/components/common/RecentAnalysisCard'
import { SectionCard } from '@/components/common/SectionCard'
import { loadPersistedAnalysis } from '@/hooks/usePersistedAnalysis'

const COMING_SOON_MODULES = [
  {
    icon: GitMerge,
    moduleName: 'Funnel Analysis',
    description:
      'Visualise drop-off at every stage of your acquisition funnel and identify where prospects disengage.',
  },
  {
    icon: Share2,
    moduleName: 'Attribution Analysis',
    description:
      'Understand which marketing channels and touchpoints drive conversion across first, middle, and last touch.',
  },
  {
    icon: Users,
    moduleName: 'Segmentation',
    description:
      'Automatically cluster your customer base by firmographic and behavioural characteristics.',
  },
  {
    icon: BarChart3,
    moduleName: 'Churn Prediction',
    description:
      'Identify at-risk accounts before they churn using historical usage and engagement signals.',
  },
]

export function DashboardPage() {
  const navigate = useNavigate()
  // Read once on mount — no need to subscribe to storage events for MVP.
  const [persisted] = useState(() => loadPersistedAnalysis())

  const hasData = persisted !== null

  const kpis = hasData
    ? [
        {
          title: 'Total Leads',
          value: persisted.kpis.totalLeads.toLocaleString(),
          icon: Users,
          trend: undefined,
        },
        {
          title: 'Converted Leads',
          value: persisted.kpis.convertedLeads.toLocaleString(),
          icon: CheckCircle,
          trend: undefined,
        },
        {
          title: 'Conversion Rate',
          value: `${persisted.kpis.conversionRate.toFixed(1)}%`,
          icon: TrendingUp,
          trend: undefined,
        },
        {
          title: 'SQL Count',
          value: persisted.kpis.sqlCount.toLocaleString(),
          icon: Zap,
          trend: undefined,
        },
      ]
    : PLACEHOLDER_KPIS

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* Welcome */}
      <PageHeader
        title="Welcome back"
        description={
          hasData
            ? `Last analysis: ${persisted.fileName} · ${persisted.rowCount.toLocaleString()} leads`
            : 'Upload a lead dataset on the Lead Intelligence page to get started.'
        }
      />

      {/* KPI grid */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <MetricCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              icon={kpi.icon}
            />
          ))}
        </div>
        {!hasData && (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Showing sample data — run your first analysis to see real numbers.
          </p>
        )}
      </section>

      {/* Recent analysis */}
      <SectionCard
        title="Recent Analysis"
        description="Results from your last uploaded dataset."
      >
        {hasData ? (
          <RecentAnalysisCard analysis={persisted} />
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No analysis yet"
            description="Upload your first historical lead dataset to begin. Results will appear here after your first analysis."
            action={{
              label: 'Upload Historical Dataset',
              onClick: () => { void navigate('/lead-intelligence') },
            }}
          />
        )}
      </SectionCard>

      {/* Coming soon */}
      <section aria-labelledby="coming-soon-heading">
        <div className="mb-4 space-y-1">
          <h2 id="coming-soon-heading" className="text-[18px] font-semibold text-foreground">
            More modules coming soon
          </h2>
          <p className="text-[13px] text-muted-foreground">
            GrowthPilot AI is expanding. These analytics modules are in development.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COMING_SOON_MODULES.map((mod) => (
            <ComingSoonCard
              key={mod.moduleName}
              icon={mod.icon}
              moduleName={mod.moduleName}
              description={mod.description}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

const PLACEHOLDER_KPIS = [
  {
    title: 'Total Leads',
    value: '—',
    icon: Users,
    trend: undefined,
  },
  {
    title: 'Converted Leads',
    value: '—',
    icon: CheckCircle,
    trend: undefined,
  },
  {
    title: 'Conversion Rate',
    value: '—',
    icon: TrendingUp,
    trend: undefined,
  },
  {
    title: 'SQL Count',
    value: '—',
    icon: Zap,
    trend: undefined,
  },
]
