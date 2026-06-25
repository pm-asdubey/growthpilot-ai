import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  disabled?: boolean
  comingSoon?: boolean
}

export interface NavSection {
  items: NavItem[]
}
