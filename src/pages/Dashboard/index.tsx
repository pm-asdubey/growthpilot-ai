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
import { SectionCard } from '@/components/common/SectionCard'

const kpis = [
  {
    title: 'Total Leads',
    value: '12,450',
    trend: { direction: 'up' as const, label: '+18% vs last quarter' },
    icon: Users,
  },
  {
    title: 'Converted Leads',
    value: '2,291',
    trend: { direction: 'up' as const, label: '+12% vs last quarter' },
    icon: CheckCircle,
  },
  {
    title: 'Conversion Rate',
    value: '18.4%',
    trend: { direction: 'up' as const, label: '+2.1 pts vs last quarter' },
    icon: TrendingUp,
  },
  {
    title: 'SQL Count',
    value: '1,868',
    trend: { direction: 'down' as const, label: '−4% vs last quarter' },
    icon: Zap,
  },
]

const comingSoonModules = [
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

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* Welcome */}
      <PageHeader
        title="Welcome back"
        description="Here's a summary of your lead intelligence data. Upload a dataset to get started."
      />

      {/* KPI grid */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key performance indicators
        </h2>
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
      </section>

      {/* Recent analysis */}
      <SectionCard
        title="Recent Analysis"
        description="Your most recent lead intelligence results appear here."
      >
        <EmptyState
          icon={TrendingUp}
          title="No analysis yet"
          description="Upload your first historical lead dataset to begin. Results will appear here after your first analysis."
          action={{
            label: 'Upload Historical Dataset',
            onClick: () => void navigate('/lead-intelligence'),
          }}
        />
      </SectionCard>

      {/* Coming soon */}
      <section aria-labelledby="coming-soon-heading">
        <div className="mb-4 space-y-1">
          <h2
            id="coming-soon-heading"
            className="text-[18px] font-semibold text-foreground"
          >
            More modules coming soon
          </h2>
          <p className="text-[13px] text-muted-foreground">
            GrowthPilot AI is expanding. These analytics modules are in development.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {comingSoonModules.map((mod) => (
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
