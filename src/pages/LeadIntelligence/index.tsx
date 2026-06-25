import { UploadCloud } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'

export function LeadIntelligencePage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <PageHeader
        title="Lead Intelligence"
        description="Upload a historical lead dataset to generate conversion analysis, feature importance scores, lead rankings, and AI-generated business insights."
      />

      <SectionCard>
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          {/* Illustration placeholder */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <UploadCloud size={40} className="text-primary" aria-hidden="true" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-[22px] font-semibold text-foreground">
              Upload your lead dataset
            </h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Upload a CSV file containing your historical lead data. GrowthPilot AI will
              automatically analyse conversion patterns, score each lead, and generate an
              executive-ready summary — in seconds.
            </p>
          </div>

          {/* CTA — wired in Phase 3 */}
          <button
            type="button"
            disabled
            aria-label="Upload Historical Dataset — available in a future phase"
            className="mt-2 rounded-[10px] bg-primary px-6 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Upload Historical Dataset
          </button>

          {/* Supported format hint */}
          <p className="text-[12px] text-muted-foreground">
            Supports <span className="font-medium">.csv</span> files up to{' '}
            <span className="font-medium">25 MB</span> · Maximum{' '}
            <span className="font-medium">10,000 rows</span>
          </p>

          {/* What happens next */}
          <div className="mt-4 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-[10px] border border-border bg-background p-4"
              >
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[13px] font-bold text-primary">
                  {step.number}
                </div>
                <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

const steps = [
  {
    number: '1',
    title: 'Upload & Validate',
    description: 'Drop in your CSV. We check required columns, data types, and missing values instantly.',
  },
  {
    number: '2',
    title: 'Analytics Engine',
    description: 'Deterministic algorithms calculate conversion rates, feature importance, and lead scores.',
  },
  {
    number: '3',
    title: 'AI Insights',
    description: 'An executive summary, recommendations, and risk analysis are generated from your results.',
  },
]
