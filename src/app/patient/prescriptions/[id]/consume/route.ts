import { NextResponse } from 'next/server'
import { requireRole, serverApiRequest } from '@/lib/auth/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  try {
    await requireRole(['PATIENT'])

    await serverApiRequest({
      url: `/prescriptions/${id}/consume`,
      method: 'PATCH',
      data: {},
    })

    return NextResponse.redirect(
      new URL(`/patient/prescriptions/${id}`, request.url),
      { status: 303 },
    )
  } catch {
    return NextResponse.redirect(
      new URL('/patient/prescriptions', request.url),
      { status: 303 },
    )
  }
}
