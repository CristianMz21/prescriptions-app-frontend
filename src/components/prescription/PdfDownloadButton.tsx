"use client";

import { Button } from "@/components/ui/button";
import { BROWSER_API_PROXY_BASE_URL } from "@/lib/api/client";

interface PdfDownloadButtonProps {
  prescriptionId: string;
}

export function PdfDownloadButton({ prescriptionId }: PdfDownloadButtonProps) {
  return (
    <Button
      variant="outline"
      size="default"
      onClick={() =>
        // Route through the same-origin proxy so the Vercel-host HttpOnly
        // session cookie travels with the request. Hitting `API_BASE_URL`
        // directly is cross-origin and the browser strips the cookie →
        // backend returns 401.
        window.open(
          `${BROWSER_API_PROXY_BASE_URL}/prescriptions/${prescriptionId}/pdf`,
          "_blank",
          "noopener,noreferrer",
        )
      }
    >
      <span className="material-symbols-outlined text-lg">download</span>
      Download PDF
    </Button>
  );
}
