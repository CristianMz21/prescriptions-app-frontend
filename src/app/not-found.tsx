import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { routes } from '@/lib/routes'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-background">
      <span className="material-symbols-outlined text-7xl text-on-surface-variant">
        explore_off
      </span>
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest">Lost path</h1>
        <p className="text-base text-on-surface-variant mt-2">
          The route you tried to reach is not part of the system.
        </p>
      </div>
      <Link href={routes.login} className={buttonVariants()}>
        <span className="material-symbols-outlined text-base">home</span>
        Return home
      </Link>
    </div>
  )
}
