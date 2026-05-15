import type { ReactNode } from "react";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import { PrescriptionStatusBadge } from "./PrescriptionStatusBadge";
import {
  getPrescriptionExpiry,
  getUserDisplayName,
} from "@/lib/prescription-ui";
import { formatDate } from "@/lib/utils";

interface PrescriptionCardProps {
  prescription: PrescriptionResponseDto;
  actions?: ReactNode;
}

export function PrescriptionCard({
  prescription: rx,
  actions,
}: PrescriptionCardProps) {
  const isPending = rx.status === "PENDING";
  const expiryDate = getPrescriptionExpiry(rx);
  const isExpired =
    isPending && expiryDate && new Date(expiryDate) < new Date();

  const lead = rx.items?.[0];
  const extraCount = Math.max(0, (rx.items?.length ?? 0) - 1);

  return (
    <div
      data-testid="prescription-card"
      data-rx-code={rx.code}
      className={`glass-panel rounded-xl p-4 md:p-6 relative group overflow-hidden ${
        isExpired ? "opacity-80" : ""
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          isExpired
            ? "bg-error"
            : isPending
              ? "bg-surface-variant group-hover:bg-primary"
              : "bg-surface-variant"
        }`}
      />

      <div className="flex flex-col gap-6 pl-2">
        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
          <div className="flex flex-col gap-1">
            <span className="label-uppercase tracking-widest">RX Number</span>
            <span className="text-base font-medium text-primary font-mono tracking-wider">
              {rx.code}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PrescriptionStatusBadge status={rx.status} />
            {isExpired && (
              <span className="text-[0.65rem] font-bold text-error uppercase tracking-widest bg-error/10 px-2 py-0.5 rounded border border-error/20">
                Expired
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <div className="md:col-span-2 flex flex-col gap-2">
            {lead ? (
              <>
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  {lead.name}
                  {lead.dosage ? (
                    <span className="text-on-surface-variant font-normal">
                      {" "}
                      {lead.dosage}
                    </span>
                  ) : null}
                  <span className="text-sm font-medium text-on-surface-variant ml-2 tabular-nums">
                    {lead.quantity ? (
                      `×${lead.quantity}`
                    ) : (
                      <span className="italic text-[0.7rem]">
                        Qty: Not specified
                      </span>
                    )}
                  </span>
                  {extraCount > 0 ? (
                    <span className="text-xs font-semibold text-on-surface-variant border border-outline-variant rounded-full px-2 py-0.5 ml-auto">
                      +{extraCount} more
                    </span>
                  ) : null}
                </h3>
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3">
                  <span className="label-uppercase tracking-widest block mb-1">
                    Instructions
                  </span>
                  <p className="text-base text-on-surface">
                    {lead.instructions || "No instructions provided"}
                  </p>
                </div>
                {extraCount > 0 && rx.items ? (
                  <details className="mt-2 group">
                    <summary className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                      Show all medications
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-on-surface">
                      {rx.items.slice(1).map((item, idx) => (
                        <li
                          key={item.id ?? idx}
                          className="flex justify-between items-center py-1 border-b border-outline-variant/10 last:border-0"
                        >
                          <span>
                            <span className="font-medium text-primary">
                              {item.name}
                            </span>
                            {item.dosage ? (
                              <span className="text-on-surface-variant ml-1">
                                {item.dosage}
                              </span>
                            ) : null}
                          </span>
                          <span className="text-on-surface-variant tabular-nums text-xs">
                            {item.quantity
                              ? `×${item.quantity}`
                              : "Qty: Not specified"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 border-l-0 md:border-l border-outline-variant/30 md:pl-6 lg:pl-8 pt-2 md:pt-0">
            {rx.author ? (
              <div className="flex flex-col gap-1">
                <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                  Prescribed By
                </span>
                <span className="text-sm text-on-surface font-medium">
                  {getUserDisplayName(
                    rx.author.user as { email?: string; name?: string },
                  ) ||
                    rx.author.signatureText ||
                    rx.author.user?.email ||
                    "N/A"}
                </span>
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                Date Issued
              </span>
              <span className="text-sm text-on-surface tabular-nums">
                {formatDate(rx.createdAt)}
              </span>
            </div>
            {expiryDate && (
              <div className="flex flex-col gap-1">
                <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                  Valid Until
                </span>
                <span
                  className={`text-sm tabular-nums ${isExpired ? "text-error font-bold" : "text-on-surface"}`}
                >
                  {formatDate(expiryDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {actions && !isExpired ? (
          <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 sm:gap-3 pt-4 mt-2 border-t border-outline-variant/20 [&>*]:w-full sm:[&>*]:w-auto">
            {actions}
          </div>
        ) : isExpired ? (
          <div className="flex justify-end items-center pt-4 mt-2 border-t border-outline-variant/20">
            <span className="text-xs text-error/60 italic">
              Actions unavailable for expired prescriptions
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
