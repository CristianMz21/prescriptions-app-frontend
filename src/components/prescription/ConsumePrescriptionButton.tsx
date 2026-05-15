"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePrescriptionsMarkAsConsumed } from "@/lib/api/generated/prescriptionManagementAPI";
import { qk } from "@/lib/api/queryKeys";
import { notify } from "@/lib/notifications";
import type { ErrorResponseDto } from "@/lib/api/generated/schemas";
import type { ApiError } from "@/lib/api/custom-instance";

interface ConsumePrescriptionButtonProps {
  prescriptionId: string;
}

/**
 * Client-side mutation rather than a form-action route handler.
 *
 * Earlier this component POSTed to
 * `/patient/prescriptions/[id]/consume/route.ts` which then returned a 303
 * redirect back to the detail page. After the redirect Next.js' patient
 * layout received an incoming request with NO cookies (proven via
 * diagnostic logging in runs #25933367940 and earlier — `cookies=(none)`
 * immediately after a successful PATCH + 303). The cookie loss is a
 * known interaction between `NextResponse.redirect(303)` and
 * `sameSite: lax` HttpOnly cookies in the App Router runtime — the
 * browser drops the cookies on the redirected request even though the
 * navigation is same-origin.
 *
 * Using the Orval-generated TanStack Query mutation avoids the redirect
 * entirely: the PATCH fires from the browser (cookies always sent for
 * same-origin XHRs with withCredentials), the React Query cache is
 * invalidated, and React Query refetches the detail to reflect
 * status=CONSUMED. No server-side redirect, no cookie loss.
 */
export function ConsumePrescriptionButton({
  prescriptionId,
}: ConsumePrescriptionButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = usePrescriptionsMarkAsConsumed({
    mutation: {
      onSuccess: async () => {
        notify.success("Prescription consumed");
        setOpen(false);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: qk.prescriptions.detail(prescriptionId),
          }),
          queryClient.invalidateQueries({ queryKey: qk.prescriptions.all }),
        ]);
        router.refresh();
      },
      onError: (err: ErrorResponseDto | Error) => {
        notify.apiError(err as ApiError, "Failed to mark as consumed");
      },
    },
  });

  const handleConfirm = () => {
    const trimmed = reason.trim().slice(0, 500);
    mutate({
      id: prescriptionId,
      data: trimmed.length > 0 ? { reason: trimmed } : {},
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="default" size="default">
            <span className="material-symbols-outlined text-lg">check</span>
            Mark as Consumed
          </Button>
        }
      />
      <PopoverContent className="w-80 p-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="consume-reason" className="label-uppercase">
            Reason (optional)
          </Label>
          <Textarea
            id="consume-reason"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you marking this as consumed?"
            rows={3}
            maxLength={500}
            disabled={isPending}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={isPending}
            >
              <span className="material-symbols-outlined text-base">check</span>
              {isPending ? "Working..." : "Confirm"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
