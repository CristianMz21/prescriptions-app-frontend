import type { ReactNode } from "react";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import { PrescriptionStatusBadge } from "./PrescriptionStatusBadge";

interface PrescriptionDetailPanelProps {
  prescription: PrescriptionResponseDto;
  actions?: ReactNode;
}

export function PrescriptionDetailPanel({
  prescription: rx,
  actions,
}: PrescriptionDetailPanelProps) {
  const isPending = rx.status === "PENDING";
  const lead = rx.items?.[0];
  const extras = rx.items?.slice(1) ?? [];

  return (
    <>
      <div className="glass-panel rounded-xl p-6 relative group overflow-hidden mb-8">
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isPending ? "bg-surface-variant" : "bg-primary"
          }`}
        />

        <div className="flex flex-col gap-6 pl-2">
          <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
            <div className="flex flex-col gap-1">
              <span className="label-uppercase tracking-widest">RX Number</span>
              <span className="text-lg font-medium text-primary font-mono tracking-wider">
                {rx.code}
              </span>
            </div>
            <PrescriptionStatusBadge status={rx.status} />
          </div>

          {lead ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-primary">
                  {lead.name}
                  {lead.dosage ? (
                    <span className="text-on-surface-variant">
                      {" "}
                      {lead.dosage}
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
                {lead.quantity ? (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">
                      inventory_2
                    </span>
                    Quantity: {lead.quantity}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4 border-l-0 md:border-l border-outline-variant/30 md:pl-8 pt-4 md:pt-0">
                {rx.author ? (
                  <div className="flex flex-col gap-1">
                    <span className="label-uppercase tracking-widest">
                      Prescribed By
                    </span>
                    <span className="text-base text-on-surface">
                      {rx.author.signatureText ||
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
                  <span className="label-uppercase tracking-widest">
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
                {rx.consumedAt ? (
                  <div className="flex flex-col gap-1">
                    <span className="label-uppercase tracking-widest">
                      Consumed On
                    </span>
                    <span className="text-base text-primary tabular-nums">
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
              <span className="label-uppercase tracking-widest block mb-2">
                Notes
              </span>
              <p className="text-base text-on-surface">{rx.notes}</p>
            </div>
          ) : null}

          {actions ? (
            <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-outline-variant/20">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      {extras.length > 0 ? (
        <div className="glass-panel rounded-xl p-6">
          <h4 className="text-lg font-semibold text-primary mb-4">
            All Medications
          </h4>
          <div className="space-y-4">
            {extras.map((item, index) => (
              <div
                key={item.id || index}
                className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-base font-medium text-primary">
                      {item.name}
                    </span>
                    {item.dosage ? (
                      <span className="text-sm text-on-surface-variant ml-2">
                        {item.dosage}
                      </span>
                    ) : null}
                  </div>
                  {item.quantity ? (
                    <span className="text-xs text-on-surface-variant">
                      Qty: {item.quantity}
                    </span>
                  ) : null}
                </div>
                {item.instructions ? (
                  <p className="text-sm text-on-surface-variant mt-1">
                    {item.instructions}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
