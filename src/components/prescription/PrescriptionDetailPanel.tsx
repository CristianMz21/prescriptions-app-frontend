import type { ReactNode } from "react";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import { PrescriptionStatusBadge } from "./PrescriptionStatusBadge";
import { getPrescriptionExpiry, getUserDisplayName } from "@/lib/prescription-ui";

interface PrescriptionDetailPanelProps {
  prescription: PrescriptionResponseDto;
  actions?: ReactNode;
}

export function PrescriptionDetailPanel({
  prescription: rx,
  actions,
}: PrescriptionDetailPanelProps) {
  const isPending = rx.status === "PENDING";
  const expiryDate = getPrescriptionExpiry(rx);
  const isExpired = isPending && expiryDate && new Date(expiryDate) < new Date();
  
  const lead = rx.items?.[0];
  const extras = rx.items?.slice(1) ?? [];

  return (
    <>
      <div className={`glass-panel rounded-xl p-6 relative group overflow-hidden mb-8 ${isExpired ? "opacity-90" : ""}`}>
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isExpired ? "bg-error" : isPending ? "bg-surface-variant" : "bg-primary"
          }`}
        />

        <div className="flex flex-col gap-6 pl-2">
          <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
            <div className="flex flex-col gap-1">
              <span className="label-uppercase tracking-widest text-[0.65rem] text-on-surface-variant">RX Number</span>
              <span className="text-lg font-bold text-primary font-mono tracking-wider">
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

          {lead ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-primary">
                  {lead.name}
                  {lead.dosage ? (
                    <span className="text-on-surface-variant font-normal">
                      {" "}
                      {lead.dosage}
                    </span>
                  ) : null}
                </h3>
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-4 mb-2">
                  <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant block mb-1">
                    Instructions
                  </span>
                  <p className="text-base text-on-surface leading-relaxed">
                    {lead.instructions || "No instructions provided"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-on-surface-variant">
                      inventory_2
                    </span>
                    {lead.quantity ? (
                      `Quantity: ${lead.quantity}`
                    ) : (
                      "Quantity not specified"
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-l-0 md:border-l border-outline-variant/30 md:pl-8 pt-4 md:pt-0">
                {rx.author ? (
                  <div className="flex flex-col gap-1">
                    <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                      Prescribed By
                    </span>
                    <span className="text-base text-on-surface font-semibold">
                      {getUserDisplayName(
                        rx.author.user as { email?: string; name?: string },
                      ) ||
                        rx.author.signatureText ||
                        rx.author.user?.email ||
                        "N/A"}
                    </span>
                    {rx.author.specialty ? (
                      <span className="text-xs text-on-surface-variant">
                        {rx.author.specialty}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-col gap-1">
                  <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                    Date Issued
                  </span>
                  <span className="text-base text-on-surface tabular-nums">
                    {new Date(rx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {expiryDate && (
                  <div className="flex flex-col gap-1">
                    <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                      Valid Until
                    </span>
                    <span className={`text-base tabular-nums ${isExpired ? "text-error font-bold" : "text-on-surface"}`}>
                      {new Date(expiryDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {rx.consumedAt ? (
                  <div className="flex flex-col gap-1">
                    <span className="label-uppercase tracking-widest text-[0.6rem] text-on-surface-variant">
                      Consumed On
                    </span>
                    <span className="text-base text-primary tabular-nums font-semibold">
                      {new Date(rx.consumedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {rx.notes ? (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <span className="label-uppercase tracking-widest block mb-2 text-[0.6rem] text-on-surface-variant">
                Internal Notes
              </span>
              <p className="text-base text-on-surface italic">{rx.notes}</p>
            </div>
          ) : null}

          {actions && !isExpired ? (
            <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-outline-variant/20">
              {actions}
            </div>
          ) : isExpired ? (
            <div className="flex justify-end items-center pt-4 mt-2 border-t border-outline-variant/20">
               <span className="text-xs text-error/60 italic font-medium">Actions unavailable for expired prescriptions</span>
            </div>
          ) : null}
        </div>
      </div>

      {extras.length > 0 ? (
        <div className="glass-panel rounded-xl p-6">
          <h4 className="text-lg font-bold text-primary mb-6 border-b border-outline-variant/30 pb-2">
            Other Medications in this RX
          </h4>
          <div className="space-y-6">
            {extras.map((item, index) => (
              <div
                key={item.id || index}
                className="border-b border-outline-variant/10 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-semibold text-primary">
                      {item.name}
                    </span>
                    {item.dosage ? (
                      <span className="text-sm text-on-surface-variant ml-2 font-normal">
                        {item.dosage}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-variant/20 px-2 py-1 rounded">
                    {item.quantity ? (
                      `${item.quantity}`
                    ) : (
                      "Quantity not specified"
                    )}
                  </span>
                </div>
                {item.instructions ? (
                  <div className="bg-surface-variant/10 rounded p-3 mt-2">
                     <span className="label-uppercase text-[0.55rem] block mb-1">Instructions</span>
                     <p className="text-sm text-on-surface">
                        {item.instructions}
                     </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
