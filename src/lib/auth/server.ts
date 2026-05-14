import { redirect } from 'next/navigation'
import type { UserProfileResponseDto } from '@/lib/api/generated/schemas'
import { apiClient } from '@/lib/api/client'

export async function getAuth(): Promise<UserProfileResponseDto | null> {
  try {
    const response =
      await apiClient.get<UserProfileResponseDto>('/auth/profile')
    return response.data
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<UserProfileResponseDto> {
  const auth = await getAuth()
  if (!auth) {
    redirect('/login')
  }
  return auth
}

export async function requireRole(allowedRoles: UserProfileResponseDto['role'][]): Promise<UserProfileResponseDto> {
  const auth = await requireAuth()
  if (!allowedRoles.includes(auth.role)) {
    redirect('/login')
  }
  return auth
}