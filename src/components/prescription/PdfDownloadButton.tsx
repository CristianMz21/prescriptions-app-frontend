"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BROWSER_API_PROXY_BASE_URL } from "@/lib/api/client";
import { notify } from "@/lib/notifications";

interface PdfDownloadButtonProps {
  prescriptionId: string;
}

/**
 * Fetches the PDF through the same-origin proxy (so the Vercel-host
 * HttpOnly cookie travels) and triggers a download.
 *
 * UX requirements addressed:
 *  - Button is disabled + labelled "Generating PDF…" while in flight
 *    to prevent double-clicks (and to surface what's happening).
 *  - `aria-busy` flips so screen readers announce the pending state.
 *  - On failure, a toast surfaces the backend error; the button
 *    returns to its normal label so the user can retry.
 */
export function PdfDownloadButton({ prescriptionId }: PdfDownloadButtonProps) {
  const [isPending, setPending] = useState(false);

  async function handleDownload() {
    if (isPending) return;
    setPending(true);
    const url = `${BROWSER_API_PROXY_BASE_URL}/prescriptions/${prescriptionId}/pdf`;
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(
          `Failed to generate PDF (HTTP ${res.status}). Please try again.`,
        );
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = `prescription-${prescriptionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Give the browser a tick to start the download before revoking.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
    } catch (err) {
      notify.apiError(err, "Failed to download PDF");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="default"
      data-testid="pdf-download-button"
      aria-busy={isPending}
      disabled={isPending}
      onClick={handleDownload}
    >
      <span
        aria-hidden="true"
        className={`material-symbols-outlined text-lg ${
          isPending ? "animate-spin motion-reduce:animate-none" : ""
        }`}
      >
        {isPending ? "progress_activity" : "download"}
      </span>
      {isPending ? "Generating PDF…" : "Download PDF"}
    </Button>
  );
}
