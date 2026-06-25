import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  // Mobile: drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false)
  // Desktop: sidebar collapsed/expanded
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={mobileOpen}
        isCollapsed={collapsed}
        onCollapse={setCollapsed}
        onClose={() => { setMobileOpen(false) }}
      />

      {/* Main area shifts right on desktop to accommodate sidebar */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-200 ease-in-out',
          collapsed ? 'md:ml-[64px]' : 'md:ml-[280px]',
        )}
      >
        <Header
          onMenuToggle={() => { setMobileOpen((o) => !o) }}
          isSidebarOpen={mobileOpen}
        />

        <main
          id="main-content"
          className="flex-1 px-4 py-6 md:px-8 md:py-8"
          tabIndex={-1}
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
