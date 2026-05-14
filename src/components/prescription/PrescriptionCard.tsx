import type { ReactNode } from 'react'
import type { PrescriptionResponseDto } from '@/lib/api/generated/schemas'
import { PrescriptionStatusBadge } from './PrescriptionStatusBadge'

interface PrescriptionCardProps {
  prescription: PrescriptionResponseDto
  actions?: ReactNode
}

export function PrescriptionCard({
  prescription: rx,
  actions,
}: PrescriptionCardProps) {
  const isPending = rx.status === 'PENDING'
  const lead = rx.items?.[0]
  const extraCount = Math.max(0, (rx.items?.length ?? 0) - 1)

  return (
    <div
      data-testid="prescription-card"
      data-rx-code={rx.code}
      className="glass-panel rounded-xl p-6 relative group overflow-hidden"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          isPending ? 'bg-surface-variant group-hover:bg-primary' : 'bg-surface-variant'
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
          <PrescriptionStatusBadge status={rx.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-2">
            {lead ? (
              <>
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  {lead.name}
                  {lead.dosage ? (
                    <span className="text-on-surface-variant"> {lead.dosage}</span>
                  ) : null}
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
                    {lead.instructions || 'No instructions provided'}
                  </p>
                </div>
                {extraCount > 0 && rx.items ? (
                  <details className="mt-2 group">
                    <summary className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                      Show all medications
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-on-surface">
                      {rx.items.slice(1).map((item, idx) => (
                        <li key={item.id ?? idx} className="flex justify-between">
                          <span>
                            <span className="font-medium">{item.name}</span>
                            {item.dosage ? (
                              <span className="text-on-surface-variant ml-1">{item.dosage}</span>
                            ) : null}
                          </span>
                          {item.quantity ? (
                            <span className="text-on-surface-variant tabular-nums">
                              ×{item.quantity}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 border-l-0 md:border-l border-outline-variant/30 md:pl-8 pt-4 md:pt-0">
            {rx.author ? (
              <div className="flex flex-col gap-1">
                <span className="label-uppercase tracking-widest">Prescribed By</span>
                <span className="text-base text-on-surface">
                  {rx.author.signatureText || rx.author.user?.email || 'N/A'}
                </span>
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <span className="label-uppercase tracking-widest">Date Issued</span>
              <span className="text-base text-on-surface tabular-nums">
                {new Date(rx.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {actions ? (
          <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-outline-variant/20">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
