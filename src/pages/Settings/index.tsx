import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your workspace configuration and preferences."
      />

      <SectionCard>
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Settings size={26} aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-[15px] font-semibold text-foreground">Settings coming soon</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Workspace configuration, API key management, and preferences will be available in a
              future release.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
