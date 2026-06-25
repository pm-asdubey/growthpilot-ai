import { cn } from '@/lib/utils'

interface GrowthPilotLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { box: 'h-6 w-6 rounded-md text-[11px]', text: 'text-[13px]' },
  md: { box: 'h-8 w-8 rounded-lg text-[13px]', text: 'text-[15px]' },
  lg: { box: 'h-10 w-10 rounded-xl text-[16px]', text: 'text-[18px]' },
}

export function GrowthPilotLogo({ size = 'md', className }: GrowthPilotLogoProps) {
  const s = SIZE_MAP[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center font-bold text-primary-foreground',
          'bg-primary shadow-sm',
          s.box,
        )}
        aria-hidden="true"
      >
        G
      </span>
      <span className={cn('font-semibold text-foreground leading-none', s.text)}>
        GrowthPilot <span className="text-primary">AI</span>
      </span>
    </div>
  )
}

export function GrowthPilotIcon({ size = 'md', className }: GrowthPilotLogoProps) {
  const s = SIZE_MAP[size]
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center font-bold text-primary-foreground bg-primary shadow-sm',
        s.box,
        className,
      )}
      aria-label="GrowthPilot AI"
    >
      G
    </span>
  )
}
