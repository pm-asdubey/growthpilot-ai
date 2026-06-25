import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  GitMerge,
  LayoutDashboard,
  Settings,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types/navigation'

const primaryNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Lead Intelligence', path: '/lead-intelligence', icon: TrendingUp },
]

const comingSoonNav: NavItem[] = [
  { label: 'Funnel Analysis', path: '/funnel', icon: GitMerge, comingSoon: true },
  { label: 'Attribution', path: '/attribution', icon: Share2, comingSoon: true },
  { label: 'Segmentation', path: '/segmentation', icon: Users, comingSoon: true },
]

const bottomNav: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onCollapse: (collapsed: boolean) => void
  onClose: () => void
}

export function Sidebar({ isOpen, isCollapsed, onCollapse, onClose }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card',
          'transition-all duration-200 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, width collapses
          'md:translate-x-0',
          isCollapsed ? 'md:w-[64px]' : 'md:w-[280px]',
          // Mobile always full-width sidebar (280px)
          'w-[280px]',
        )}
      >
        {/* Brand header */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-border px-4',
            isCollapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">
                G
              </span>
              <span className="text-[15px] font-semibold text-foreground">GrowthPilot AI</span>
            </div>
          )}
          {isCollapsed && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">
              G
            </span>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => { onCollapse(!isCollapsed) }}
            className={cn(
              'hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground',
              'transition-colors hover:bg-accent hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'md:flex',
              isCollapsed && 'mt-0',
            )}
          >
            {isCollapsed ? (
              <ChevronRight size={15} aria-hidden="true" />
            ) : (
              <ChevronLeft size={15} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Site navigation">
          {/* Primary nav */}
          <ul role="list" className="space-y-0.5">
            {primaryNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  aria-label={item.label}
                  className={({ isActive: linkActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      linkActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      isCollapsed && 'justify-center px-2',
                    )
                  }
                >
                  <item.icon
                    size={18}
                    aria-hidden="true"
                    className={cn('shrink-0', isActive(item.path) && 'text-primary')}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Divider + Coming Soon */}
          <div className="my-2">
            {!isCollapsed && (
              <div className="mb-2 flex items-center gap-2 px-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Coming Soon
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            {isCollapsed && <div className="mx-3 my-2 h-px bg-border" />}

            <ul role="list" className="space-y-0.5">
              {comingSoonNav.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    aria-label={`${item.label} — coming soon`}
                    className={({ isActive: linkActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium',
                        'transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        linkActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground/60 hover:bg-accent hover:text-muted-foreground',
                        isCollapsed && 'justify-center px-2',
                      )
                    }
                  >
                    <item.icon size={18} aria-hidden="true" className="shrink-0 opacity-60" />
                    {!isCollapsed && (
                      <span className="flex flex-1 items-center justify-between">
                        {item.label}
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Soon
                        </span>
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Divider + bottom nav */}
          <div className="mx-3 mb-2 h-px bg-border" />
          <ul role="list" className="space-y-0.5">
            {bottomNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  aria-label={item.label}
                  className={({ isActive: linkActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      linkActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      isCollapsed && 'justify-center px-2',
                    )
                  }
                >
                  <item.icon size={18} aria-hidden="true" className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Analytics badge at bottom */}
        {!isCollapsed && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5">
              <BarChart3 size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-[12px] text-muted-foreground">
                <span className="font-medium text-foreground">Analytics first.</span> AI explains the
                numbers.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
