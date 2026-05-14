'use client'

import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api/client'

interface PdfDownloadButtonProps {
  prescriptionId: string
}

export function PdfDownloadButton({ prescriptionId }: PdfDownloadButtonProps) {
  return (
    <Button
      variant="outline"
      size="default"
      onClick={() =>
        window.open(
          `${API_BASE_URL}/prescriptions/${prescriptionId}/pdf`,
          '_blank',
          'noopener,noreferrer',
        )
      }
    >
      <span className="material-symbols-outlined text-lg">download</span>
      Download PDF
    </Button>
  )
}
