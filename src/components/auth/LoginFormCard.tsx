"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/useAuth";

export function LoginFormCard() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || "Login failed");
        return;
      }

      if (err instanceof Error) {
        setError(err.message);
        return;
      }

      setError("An unexpected error occurred");
    }
  }

  return (
    <div className="card-glass w-full rounded-xl p-5 shadow-2xl sm:p-8">
      <form
        className="flex flex-col gap-5 sm:gap-6"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="label-uppercase">
            Operator Identity
          </Label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
              account_circle
            </span>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter designated email"
              className="h-11 pl-10 text-base"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="label-uppercase">
            Security Key
          </Label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
              key
            </span>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter security key"
              className="h-11 pl-10 text-base"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <div aria-live="polite" className="min-h-5">
          {error ? (
            <p
              className="flex items-center gap-2 text-sm text-error"
              role="alert"
              data-testid="login-error"
            >
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={isLoading} className="mt-1 h-11 w-full">
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
          ) : (
            <>
              <span className="font-bold uppercase tracking-widest">
                Sign In
              </span>
              <span className="material-symbols-outlined text-lg">login</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-start gap-3 border-t border-outline-variant/30 pt-5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <a className="transition-colors hover:text-primary" href="#">
          Forgot Password
        </a>
        <a className="transition-colors hover:text-primary" href="#">
          Request Access
        </a>
      </div>
    </div>
  );
}
