import { useCallback, useState } from 'react'
import type { AnalysisResult } from '@/types/analysis'
import type { AIResponse } from '@/types/ai'
import type { PersistedAnalysis } from '@/types/persistence'

const STORAGE_KEY = 'growthpilot:analysis_history'
const MAX_HISTORY = 10

function loadHistory(): PersistedAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PersistedAnalysis[]
  } catch {
    return []
  }
}

function saveHistory(history: PersistedAnalysis[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

function buildEntry(result: AnalysisResult, fileName: string): PersistedAnalysis {
  return {
    id: String(Date.now()),
    analyzedAt: new Date().toISOString(),
    fileName,
    rowCount: result.kpis.totalLeads,
    featureColumns: result.dataset.featureColumns,
    kpis: result.kpis,
    segments: { sqlThreshold: result.segments.sqlThreshold, mqlThreshold: result.segments.mqlThreshold },
    featureImportance: result.featureImportance,
    charts: result.charts,
  }
}

export function usePersistedAnalysis() {
  const [history, setHistory] = useState<PersistedAnalysis[]>(() => loadHistory())

  const saveAnalysis = useCallback((result: AnalysisResult, fileName: string) => {
    setHistory((prev) => {
      const entry = buildEntry(result, fileName)
      const updated = [entry, ...prev].slice(0, MAX_HISTORY)
      saveHistory(updated)
      return updated
    })
  }, [])

  const updateAIInsights = useCallback((id: string, aiInsights: AIResponse) => {
    setHistory((prev) => {
      const updated = prev.map((a) => a.id === id ? { ...a, aiInsights } : a)
      saveHistory(updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  const getById = useCallback((id: string): PersistedAnalysis | undefined => {
    return history.find((a) => a.id === id)
  }, [history])

  const latest = history[0] ?? null

  return { history, latest, saveAnalysis, updateAIInsights, clearHistory, getById }
}

export { loadHistory as loadPersistedHistory }
