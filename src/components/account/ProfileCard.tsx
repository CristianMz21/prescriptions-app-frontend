import type { ReactNode } from 'react'
import type { UserProfileResponseDto } from '@/lib/api/generated/schemas'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProfileCardProps {
  user: UserProfileResponseDto
  /** Extra fields rendered in a definition list below the header. */
  extras?: Array<{ label: string; value: ReactNode }>
  /** Footer slot for actions (e.g. theme toggle). */
  actions?: ReactNode
}

export function ProfileCard({ user, extras = [], actions }: ProfileCardProps) {
  return (
    <Card className="card-glass p-6 gap-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div className="flex flex-col gap-1">
          <span className="label-uppercase">Operator</span>
          <span className="text-2xl font-semibold text-primary">{user.email}</span>
        </div>
        <Badge variant="outline" className="uppercase tracking-widest text-[0.7rem]">
          {user.role}
        </Badge>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Account ID" value={<code className="text-xs font-mono">{user.id}</code>} />
        <Field label="Theme preference" value={user.themePreference} />
        <Field
          label="Member since"
          value={new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        />
        <Field
          label="Last update"
          value={new Date(user.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        />
        {extras.map((e) => (
          <Field key={e.label} label={e.label} value={e.value} />
        ))}
      </dl>
      {actions ? (
        <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-4">
          {actions}
        </div>
      ) : null}
    </Card>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-uppercase">{label}</dt>
      <dd className="text-base text-on-surface">{value ?? '—'}</dd>
    </div>
  )
}
