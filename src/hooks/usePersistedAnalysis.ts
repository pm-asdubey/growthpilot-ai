import { useCallback, useState } from 'react'
import type { AnalysisResult } from '@/types/analysis'
import type { PersistedAnalysis } from '@/types/persistence'

const STORAGE_KEY = 'growthpilot:last_analysis'

function load(): PersistedAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedAnalysis
  } catch {
    return null
  }
}

function save(result: AnalysisResult, fileName: string): void {
  const persisted: PersistedAnalysis = {
    kpis: result.kpis,
    segments: {
      sqlThreshold: result.segments.sqlThreshold,
      mqlThreshold: result.segments.mqlThreshold,
    },
    featureImportance: result.featureImportance,
    charts: result.charts,
    fileName,
    rowCount: result.kpis.totalLeads,
    analyzedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
}

export function usePersistedAnalysis() {
  const [persisted, setPersisted] = useState<PersistedAnalysis | null>(() => load())

  const saveAnalysis = useCallback((result: AnalysisResult, fileName: string) => {
    save(result, fileName)
    setPersisted(load())
  }, [])

  const clearAnalysis = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPersisted(null)
  }, [])

  return { persisted, saveAnalysis, clearAnalysis }
}

// Standalone loader for components that only need to read (e.g. Dashboard).
export { load as loadPersistedAnalysis }
