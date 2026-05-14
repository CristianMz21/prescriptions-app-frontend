import { redirect } from 'next/navigation'
import { getAuth } from '@/lib/auth/server'

export default async function HomePage() {
  const auth = await getAuth()

  if (!auth) {
    redirect('/login')
  }

  switch (auth.role) {
    case 'ADMIN':
      redirect('/admin/metrics')
    case 'DOCTOR':
      redirect('/doctor/prescriptions')
    case 'PATIENT':
      redirect('/patient/prescriptions')
    default:
      redirect('/login')
  }
}