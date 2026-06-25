import { AlertTriangle, ArrowRight, Lightbulb, Loader2, RefreshCw, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard'
import type { AIResponse } from '@/types/ai'

interface ErrorProps { error: string; onRetry: () => void }
interface ReadyProps { insights: AIResponse }

export function AIInsightsPanelLoading() {
  return (
    <SectionCard title="AI Executive Summary">
      <div className="flex items-center gap-3 py-8" aria-live="polite" aria-label="Generating AI insights">
        <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
        <p className="text-[14px] text-muted-foreground">Generating executive insights…</p>
      </div>
    </SectionCard>
  )
}

export function AIInsightsPanelError({ error, onRetry }: ErrorProps) {
  return (
    <SectionCard title="AI Executive Summary">
      <div role="alert" className="flex items-start gap-3 rounded-[10px] border border-error/30 bg-error/5 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
        <div className="flex-1 space-y-2">
          <p className="text-[14px] font-medium text-foreground">AI insights unavailable</p>
          <p className="text-[13px] text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">
        Analytics results above remain fully accurate — AI insights are supplementary.
      </p>
    </SectionCard>
  )
}

export function AIInsightsPanelReady({ insights }: ReadyProps) {
  return (
    <SectionCard
      title="AI Executive Summary"
      description="Generated from your analytics results. No raw data was sent to the AI."
    >
      <div className="space-y-6">
        {/* Executive summary */}
        <div className="rounded-[10px] bg-primary/5 border border-primary/10 px-5 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={15} className="text-primary" aria-hidden="true" />
            <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">Summary</p>
          </div>
          <p className="text-[14px] leading-relaxed text-foreground">{insights.executiveSummary}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Key findings */}
          <InsightList
            icon={TrendingUp}
            title="Key Findings"
            items={insights.keyFindings}
            iconColour="text-primary"
            dotColour="bg-primary"
          />

          {/* Recommendations */}
          <InsightList
            icon={Lightbulb}
            title="Recommendations"
            items={insights.recommendations}
            iconColour="text-success"
            dotColour="bg-success"
          />

          {/* Risks */}
          <InsightList
            icon={ShieldAlert}
            title="Risks"
            items={insights.risks}
            iconColour="text-warning"
            dotColour="bg-warning"
          />

          {/* Next actions */}
          <InsightList
            icon={ArrowRight}
            title="Suggested Next Actions"
            items={insights.nextActions}
            iconColour="text-accent-foreground"
            dotColour="bg-muted-foreground"
          />
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          AI insights are interpretive. All statistics are sourced from the deterministic analytics engine above.
        </p>
      </div>
    </SectionCard>
  )
}

interface InsightListProps {
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: 'true' }>
  title: string
  items: string[]
  iconColour: string
  dotColour: string
}

function InsightList({ icon: Icon, title, items, iconColour, dotColour }: InsightListProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className={iconColour} aria-hidden="true" />
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
      </div>
      <ul role="list" className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColour}`} aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
