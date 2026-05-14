'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

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
    <div className="min-h-screen flex flex-col justify-center items-center p-gutter relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-10">
        <div className="w-[800px] h-[800px] border border-outline rounded-full bg-gradient-to-tr from-surface-container-highest to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black uppercase tracking-widest text-primary">RX-OS</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-2 uppercase tracking-widest">Precision Control System</p>
        </div>

        <div className="bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-lg p-8 shadow-2xl">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest" htmlFor="email">
                Operator Identity
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">
                  account_circle
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter designated email"
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-base rounded pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest" htmlFor="password">
                Security Key
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">
                  key
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-base rounded pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary font-medium text-sm py-3 px-4 rounded hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="uppercase tracking-widest font-bold">Sign In</span>
                    <span className="material-symbols-outlined text-lg">login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
            <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#">
              Forgot Password
            </a>
            <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#">
              Request Access
            </a>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 opacity-50">
          <span className="material-symbols-outlined text-primary text-sm">lock</span>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">End-to-End Encrypted Session</span>
        </div>
      </div>
    </div>
  )
}