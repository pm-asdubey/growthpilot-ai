import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import { extractCategoricalData, getFeatureColumns, mapRowsToLeads, normalizeRows } from '@/services/analytics/mapper'
import { detectBooleanColumns, detectCategoricalColumns, getMissingKnownColumns, validateDataset } from '@/services/analytics/validator'
import type { Lead } from '@/types/lead'
import type { ValidationResult } from '@/types/validation'

export type UploadState = 'idle' | 'parsing' | 'validating' | 'error' | 'ready'

export interface CSVUploadState {
  uploadState: UploadState
  fileName: string | null
  validationResult: ValidationResult | null
  leads: Lead[] | null
  featureColumns: string[]
  categoricalColumns: string[]
  categoricalData: Record<string, string>[]
  missingKnownColumns: string[]
  error: string | null
}

export interface CSVUploadActions {
  handleFileSelected: (file: File) => void
  reset: () => void
}

const INITIAL_STATE: CSVUploadState = {
  uploadState: 'idle',
  fileName: null,
  validationResult: null,
  leads: null,
  featureColumns: [],
  categoricalColumns: [],
  categoricalData: [],
  missingKnownColumns: [],
  error: null,
}

export function useCSVUpload(): CSVUploadState & CSVUploadActions {
  const [state, setState] = useState<CSVUploadState>(INITIAL_STATE)

  const handleFileSelected = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setState({ ...INITIAL_STATE, uploadState: 'error', fileName: file.name, error: 'Only .csv files are accepted.' })
      return
    }

    setState({ ...INITIAL_STATE, uploadState: 'parsing', fileName: file.name })

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          const headers = results.meta.fields ?? []
          const lowerHeaders = headers.map((h) => h.trim().toLowerCase())
          // Normalize once here — every downstream function can then assume
          // lowercase keys regardless of how the CSV's headers were cased.
          const rows = normalizeRows(results.data, headers)

          setState((prev) => ({ ...prev, uploadState: 'validating' }))

          const validationResult = validateDataset(headers, rows, file.size)

          if (!validationResult.isValid) {
            setState((prev) => ({ ...prev, uploadState: 'error', validationResult }))
            return
          }

          const featureColumns = getFeatureColumns(lowerHeaders, rows)
          const booleanColumns = detectBooleanColumns(lowerHeaders, rows)
          const categoricalColumns = detectCategoricalColumns(lowerHeaders, rows)
          const categoricalData = extractCategoricalData(rows, categoricalColumns)
          const missingKnownColumns = getMissingKnownColumns(headers)
          const leads = mapRowsToLeads(rows, featureColumns, booleanColumns)

          setState((prev) => ({
            ...prev,
            uploadState: 'ready',
            validationResult,
            leads,
            featureColumns,
            categoricalColumns,
            categoricalData,
            missingKnownColumns,
          }))
        } catch (err) {
          // Defensive: never leave the UI stuck on "validating" — any unexpected
          // shape of data surfaces as a visible, recoverable error instead.
          const message = err instanceof Error ? err.message : 'Unknown error while processing the file.'
          setState((prev) => ({ ...prev, uploadState: 'error', error: `Could not process the file: ${message}` }))
        }
      },
      error(err) {
        setState((prev) => ({ ...prev, uploadState: 'error', error: `Could not read the file: ${err.message}` }))
      },
    })
  }, [])

  const reset = useCallback(() => { setState(INITIAL_STATE) }, [])

  return { ...state, handleFileSelected, reset }
}
