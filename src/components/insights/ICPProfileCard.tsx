import { Target } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard'
import { FormulaTooltip } from '@/components/common/FormulaTooltip'
import type { CategoricalBreakdown, FeatureBucketBreakdown } from '@/types/analysis'

interface ICPProfileCardProps {
  featureBuckets: FeatureBucketBreakdown[]
  categoricalBreakdown: CategoricalBreakdown[]
}

interface Trait {
  label: string
  value: string
  rate: number
}

const MIN_GROUP_SIZE_FOR_ICP = 5  // ignore tiny, noisy groups when picking the "best" value

// Deterministic, no AI involved: for each top feature/category, pick whichever
// value/range has the highest conversion rate (above a minimum group size so
// a single lucky outlier doesn't skew the profile) and stitch them into a
// plain-language description of who actually converts.
export function ICPProfileCard({ featureBuckets, categoricalBreakdown }: ICPProfileCardProps) {
  const numericTraits: Trait[] = featureBuckets.slice(0, 3).flatMap((fb) => {
    const candidates = fb.rows.filter((r) => r.count >= MIN_GROUP_SIZE_FOR_ICP)
    const best = [...candidates].sort((a, b) => b.conversionRate - a.conversionRate).at(0)
    return best ? [{ label: fb.label, value: best.label, rate: best.conversionRate }] : []
  })

  const categoricalTraits: Trait[] = categoricalBreakdown.slice(0, 4).flatMap((cb) => {
    const candidates = cb.rows.filter((r) => r.count >= MIN_GROUP_SIZE_FOR_ICP && !r.label.startsWith('Other ('))
    const best = [...candidates].sort((a, b) => b.conversionRate - a.conversionRate).at(0)
    return best ? [{ label: cb.label, value: best.label, rate: best.conversionRate }] : []
  })

  const traits = [...numericTraits, ...categoricalTraits].sort((a, b) => b.rate - a.rate)

  if (traits.length === 0) return null

  return (
    <SectionCard>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target size={16} aria-hidden="true" />
        </span>
        <h2 className="text-[16px] font-semibold text-foreground">Ideal Customer Profile</h2>
        <FormulaTooltip title="Ideal Customer Profile" lines={[
          'For each top feature and category, the value/range with the highest conversion rate is selected.',
          'Groups smaller than 5 leads are excluded so a single lucky outlier can\'t skew the profile.',
          'This is fully deterministic — no AI involved — derived directly from the breakdown tables below.',
        ]} />
      </div>
      <div className="flex flex-wrap gap-2">
        {traits.map((t) => (
          <span
            key={t.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[12px]"
          >
            <span className="text-muted-foreground">{t.label}:</span>
            <span className="font-semibold text-foreground">{t.value}</span>
            <span className="text-[11px] text-primary">{t.rate}%</span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">
        Leads matching these traits have historically converted at the highest rates in your dataset.
      </p>
    </SectionCard>
  )
}
