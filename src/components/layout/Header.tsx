import { Search } from 'lucide-react'
import { GrowthPilotLogo } from '@/components/common/GrowthPilotLogo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { AvatarMenu } from '@/components/common/AvatarMenu'

interface HeaderProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6"
      role="banner"
    >
      {/* Left — mobile menu toggle + product name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          {/* Hamburger / close icon using plain SVG to avoid extra deps */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {isSidebarOpen ? (
              <>
                <line x1="3" y1="3" x2="15" y2="15" />
                <line x1="15" y1="3" x2="3" y2="15" />
              </>
            ) : (
              <>
                <line x1="2" y1="5" x2="16" y2="5" />
                <line x1="2" y1="9" x2="16" y2="9" />
                <line x1="2" y1="13" x2="16" y2="13" />
              </>
            )}
          </svg>
        </button>

        <div className="md:hidden">
          <GrowthPilotLogo size="sm" />
        </div>
      </div>

      {/* Centre — search (desktop only) */}
      <div className="hidden flex-1 justify-center px-8 md:flex">
        <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <Search size={14} aria-hidden="true" className="shrink-0" />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search"
            disabled
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <div className="mx-2 h-5 w-px bg-border" aria-hidden="true" />
        <AvatarMenu />
      </div>
    </header>
  )
}
