import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { apiClient } from '@/lib/api/client'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params
  const prescriptionId = params.id

  try {
    await requireRole(['PATIENT'])

    await apiClient.post(
      `/prescriptions/${prescriptionId}/consume`,
      {},
      { withCredentials: true },
    )

    return NextResponse.redirect(
      new URL(`/patient/prescriptions/${prescriptionId}`, request.url)
    )
  } catch {
    return NextResponse.redirect(
      new URL('/patient/prescriptions', request.url)
    )
  }
}