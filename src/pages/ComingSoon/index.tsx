import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionCard } from '@/components/common/SectionCard'

interface ComingSoonPageProps {
  icon: LucideIcon
  moduleName: string
  description: string
  capabilities: string[]
}

export function ComingSoonPage({
  icon: Icon,
  moduleName,
  description,
  capabilities,
}: ComingSoonPageProps) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <SectionCard>
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          {/* Icon */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Icon size={34} className="text-muted-foreground" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-warning text-[9px] font-bold text-white">
              ★
            </span>
          </div>

          {/* Badge */}
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Coming Soon
          </span>

          <div className="max-w-lg space-y-2">
            <h1 className="text-[28px] font-bold text-foreground">{moduleName}</h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{description}</p>
          </div>

          {/* Planned capabilities */}
          {capabilities.length > 0 && (
            <div className="mt-2 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {capabilities.map((cap) => (
                <div
                  key={cap}
                  className="flex items-start gap-2.5 rounded-[10px] border border-border bg-background px-4 py-3"
                >
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-center text-[9px] leading-4 font-bold text-primary">
                    ✓
                  </span>
                  <p className="text-[13px] text-muted-foreground">{cap}</p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => void navigate('/')}
            className="mt-4 rounded-[10px] border border-border bg-background px-5 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← Back to Dashboard
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
