'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsersCreate } from '@/lib/api/generated/prescriptionManagementAPI'
import { Role, UserResponseDto, ErrorResponseDto } from '@/lib/api/generated/schemas'
import { qk } from '@/lib/api/queryKeys'
import { notify } from '@/lib/notifications'
import { routes } from '@/lib/routes'

const schema = z
  .object({
    email: z.string().email('Valid email required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([Role.ADMIN, Role.DOCTOR, Role.PATIENT]),
    specialty: z.string().max(120).optional().or(z.literal('')),
    medicalId: z.string().max(64).optional().or(z.literal('')),
    signatureText: z.string().max(120).optional().or(z.literal('')),
    birthDate: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => data.role !== Role.DOCTOR || (data.specialty?.trim().length ?? 0) > 0,
    { path: ['specialty'], message: 'Specialty is required for doctors' },
  )

type FormValues = z.infer<typeof schema>

export function CreateUserForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      role: Role.PATIENT,
      specialty: '',
      medicalId: '',
      signatureText: '',
      birthDate: '',
    },
  })

  const createMutation = useUsersCreate({
    mutation: {
      onSuccess: (user: UserResponseDto) => {
        notify.success('User created', `${user.email} (${user.role})`)
        void queryClient.invalidateQueries({ queryKey: qk.users.all() })
        void queryClient.invalidateQueries({ queryKey: qk.users.patients() })
        void queryClient.invalidateQueries({ queryKey: qk.users.doctors() })
        router.push(routes.admin.users)
      },
      onError: (err: ErrorResponseDto | Error) => notify.apiError(err, 'Failed to create user'),
    },
  })

  const role = watch('role')

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      data: {
        email: values.email,
        password: values.password,
        role: values.role,
        specialty: values.role === Role.DOCTOR && values.specialty ? values.specialty : undefined,
        medicalId: values.role === Role.DOCTOR && values.medicalId ? values.medicalId : undefined,
        signatureText:
          values.role === Role.DOCTOR && values.signatureText ? values.signatureText : undefined,
        birthDate:
          values.role === Role.PATIENT && values.birthDate ? values.birthDate : undefined,
      },
    })
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={routes.admin.users}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider w-fit mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Users
        </Link>
        <h2 className="text-3xl font-bold text-primary tracking-tight">Onboard new user</h2>
        <p className="text-base text-on-surface-variant mt-2">
          Provision an Admin, Doctor, or Patient account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="card-glass p-6 gap-6">
          <Field id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>

          <Field id="password" label="Password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
          </Field>

          <Field id="role" label="Role" error={errors.role?.message}>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v ?? Role.PATIENT)}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.PATIENT}>Patient</SelectItem>
                    <SelectItem value={Role.DOCTOR}>Doctor</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {role === Role.DOCTOR ? (
            <>
              <Field id="specialty" label="Specialty" error={errors.specialty?.message}>
                <Input id="specialty" placeholder="e.g., Cardiology" {...register('specialty')} />
              </Field>
              <Field id="medicalId" label="Medical ID" error={errors.medicalId?.message}>
                <Input id="medicalId" placeholder="MED-XXXXX" {...register('medicalId')} />
              </Field>
              <Field id="signatureText" label="Signature label" error={errors.signatureText?.message}>
                <Input id="signatureText" placeholder="Dr. Jane Doe" {...register('signatureText')} />
              </Field>
            </>
          ) : null}

          {role === Role.PATIENT ? (
            <Field id="birthDate" label="Birth date" error={errors.birthDate?.message}>
              <Input id="birthDate" type="date" {...register('birthDate')} />
            </Field>
          ) : null}

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 mt-2 border-t border-outline-variant/30">
            <Link
              href={routes.admin.users}
              className={buttonVariants({ variant: 'outline' })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Creating…
                </>
              ) : (
                'Create user'
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="label-uppercase">
        {label}
      </Label>
      {children}
      {error ? (
        <span className="text-xs text-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
