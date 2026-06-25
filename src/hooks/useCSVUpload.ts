import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import { getFeatureColumns, mapRowsToLeads } from '@/services/analytics/mapper'
import { getMissingKnownColumns, validateDataset } from '@/services/analytics/validator'
import type { Lead } from '@/types/lead'
import type { ValidationResult } from '@/types/validation'

export type UploadState = 'idle' | 'parsing' | 'validating' | 'error' | 'ready'

export interface CSVUploadState {
  uploadState: UploadState
  fileName: string | null
  validationResult: ValidationResult | null
  leads: Lead[] | null
  featureColumns: string[]
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
        const headers = results.meta.fields ?? []
        const rows = results.data

        setState((prev) => ({ ...prev, uploadState: 'validating' }))

        const validationResult = validateDataset(headers, rows, file.size)

        if (!validationResult.isValid) {
          setState((prev) => ({ ...prev, uploadState: 'error', validationResult }))
          return
        }

        const featureColumns = getFeatureColumns(headers, rows)
        const missingKnownColumns = getMissingKnownColumns(headers)
        const leads = mapRowsToLeads(rows, featureColumns)

        setState((prev) => ({
          ...prev,
          uploadState: 'ready',
          validationResult,
          leads,
          featureColumns,
          missingKnownColumns,
        }))
      },
      error(err) {
        setState((prev) => ({ ...prev, uploadState: 'error', error: `Could not read the file: ${err.message}` }))
      },
    })
  }, [])

  const reset = useCallback(() => { setState(INITIAL_STATE) }, [])

  return { ...state, handleFileSelected, reset }
}
