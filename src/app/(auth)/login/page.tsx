import { LoginFormCard } from "@/components/auth/LoginFormCard";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-margin-mobile py-8 sm:px-8 sm:py-12 lg:px-margin-desktop">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
        <div className="h-[520px] w-[520px] rounded-full border border-outline bg-gradient-to-tr from-surface-container-highest to-transparent blur-3xl sm:h-[700px] sm:w-[700px]" />
      </div>

      <section className="z-10 w-full max-w-md">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-primary sm:text-5xl">
            RX-OS
          </h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-on-surface-variant sm:text-sm">
            Precision Control System
          </p>
        </header>

        <LoginFormCard />

        <footer className="mt-6 flex items-center justify-center gap-2 opacity-60 sm:mt-8">
          <span className="material-symbols-outlined text-sm text-primary">
            lock
          </span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-on-surface-variant sm:text-xs">
            End-to-End Encrypted Session
          </span>
        </footer>
      </section>
    </main>
  );
}
