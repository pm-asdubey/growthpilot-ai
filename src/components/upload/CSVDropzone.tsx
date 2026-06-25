import { useCallback, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVDropzoneProps {
  onFileSelected: (file: File) => void
  isDisabled?: boolean
}

export function CSVDropzone({ onFileSelected, isDisabled = false }: CSVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || isDisabled) return
      onFileSelected(file)
    },
    [onFileSelected, isDisabled],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0])
      // Reset so the same file can be re-selected after a reset
      if (inputRef.current) inputRef.current.value = ''
    },
    [handleFile],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [],
  )

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="Upload CSV file — click or drag and drop"
      aria-disabled={isDisabled}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onClick={() => { inputRef.current?.click() }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[12px] border-2 border-dashed p-12 text-center',
        'cursor-pointer transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5',
        isDisabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-150',
          isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <UploadCloud size={32} aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-foreground">
          {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file here'}
        </p>
        <p className="text-[13px] text-muted-foreground">
          or{' '}
          <span className="font-medium text-primary underline-offset-2 hover:underline">
            browse your computer
          </span>
        </p>
      </div>

      <p className="text-[12px] text-muted-foreground">
        <span className="font-medium">.csv</span> files only · max{' '}
        <span className="font-medium">25 MB</span> · up to{' '}
        <span className="font-medium">10,000 rows</span>
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={handleInputChange}
        disabled={isDisabled}
      />
    </div>
  )
}
