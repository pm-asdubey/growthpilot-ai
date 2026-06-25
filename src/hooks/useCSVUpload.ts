import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import { mapRowsToLeads } from '@/services/analytics/mapper'
import { validateDataset } from '@/services/analytics/validator'
import type { Lead } from '@/types/lead'
import type { ValidationResult } from '@/types/validation'

export type UploadState = 'idle' | 'parsing' | 'validating' | 'error' | 'ready'

export interface CSVUploadState {
  uploadState: UploadState
  fileName: string | null
  validationResult: ValidationResult | null
  leads: Lead[] | null
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
  error: null,
}

export function useCSVUpload(): CSVUploadState & CSVUploadActions {
  const [state, setState] = useState<CSVUploadState>(INITIAL_STATE)

  const handleFileSelected = useCallback((file: File) => {
    // File type guard — only .csv accepted
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setState({
        ...INITIAL_STATE,
        uploadState: 'error',
        fileName: file.name,
        error: 'Only .csv files are accepted. Please upload a CSV file.',
      })
      return
    }

    setState({
      uploadState: 'parsing',
      fileName: file.name,
      validationResult: null,
      leads: null,
      error: null,
    })

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? []
        const rows = results.data

        setState((prev) => ({ ...prev, uploadState: 'validating' }))

        const validationResult = validateDataset(headers, rows, file.size)

        if (!validationResult.isValid) {
          setState((prev) => ({
            ...prev,
            uploadState: 'error',
            validationResult,
          }))
          return
        }

        const leads = mapRowsToLeads(rows)

        setState((prev) => ({
          ...prev,
          uploadState: 'ready',
          validationResult,
          leads,
        }))
      },
      error(err) {
        setState((prev) => ({
          ...prev,
          uploadState: 'error',
          error: `Could not read the file: ${err.message}. Ensure the file is a valid CSV.`,
        }))
      },
    })
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  return { ...state, handleFileSelected, reset }
}
