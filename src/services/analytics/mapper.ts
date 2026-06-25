import type { Lead } from '@/types/lead'

// Converts a validated raw PapaParse row into a strongly-typed Lead.
// Must only be called after validateDataset() returns isValid === true,
// guaranteeing all required columns are present.
export function mapRowToLead(row: Record<string, string>): Lead {
  return {
    employees: parseFloat(row.employees),
    trial_users: parseFloat(row.trial_users),
    pricing_page_visits: parseFloat(row.pricing_page_visits),
    daily_active_users: parseFloat(row.daily_active_users),
    invited_teammates: parseFloat(row.invited_teammates),
    webinar_attended: parseBoolean(row.webinar_attended),
    support_tickets: parseFloat(row.support_tickets),
    days_since_signup: parseFloat(row.days_since_signup),
    converted: parseBoolean(row.converted),
  }
}

export function mapRowsToLeads(rows: Record<string, string>[]): Lead[] {
  return rows.map(mapRowToLead)
}

function parseBoolean(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === '1' || v === 'true'
}
