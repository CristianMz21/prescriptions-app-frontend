import { NextResponse } from 'next/server'
import { requireRole, serverApiRequest } from '@/lib/auth/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  try {
    await requireRole(['PATIENT'])

    let reason: string | undefined
    const contentType = request.headers.get('content-type') ?? ''
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const raw = form.get('reason')
      if (typeof raw === 'string' && raw.trim().length > 0) {
        reason = raw.trim().slice(0, 500)
      }
    }

    await serverApiRequest({
      url: `/prescriptions/${id}/consume`,
      method: 'PATCH',
      data: reason ? { reason } : {},
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
