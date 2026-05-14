'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        setError(axiosError.response?.data?.message || 'Login failed')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-10">
        <div className="w-[800px] h-[800px] border border-outline rounded-full bg-gradient-to-tr from-surface-container-highest to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black uppercase tracking-widest text-primary">RX-OS</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-2 uppercase tracking-widest">
            Precision Control System
          </p>
        </div>

        <div className="card-glass p-8 shadow-2xl">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="label-uppercase">
                Operator Identity
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg pointer-events-none">
                  account_circle
                </span>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter designated email"
                  className="pl-10 py-3 text-base"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="label-uppercase">
                Security Key
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg pointer-events-none">
                  key
                </span>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key"
                  className="pl-10 py-3 text-base"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error ? (
              <div
                className="flex items-center gap-2 text-error text-sm"
                role="alert"
                data-testid="login-error"
              >
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            ) : null}

            <Button type="submit" disabled={isLoading} className="w-full py-3 mt-4">
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="uppercase tracking-widest font-bold">Sign In</span>
                  <span className="material-symbols-outlined text-lg">login</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
            <a
              className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider"
              href="#"
            >
              Forgot Password
            </a>
            <a
              className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider"
              href="#"
            >
              Request Access
            </a>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 opacity-50">
          <span className="material-symbols-outlined text-primary text-sm">lock</span>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            End-to-End Encrypted Session
          </span>
        </div>
      </div>
    </div>
  )
}
