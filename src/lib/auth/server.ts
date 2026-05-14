import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios, { type AxiosRequestConfig } from 'axios'
import type { UserProfileResponseDto } from '@/lib/api/generated/schemas'
import { API_BASE_URL } from '@/lib/api/client'

async function buildCookieHeader(): Promise<string> {
  const store = await cookies()
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}

export async function serverApiRequest<T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> {
  const cookieHeader = await buildCookieHeader()
  const response = await axios.request<T>({
    baseURL: API_BASE_URL,
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers ?? {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  })
  return response.data
}

export async function getAuth(): Promise<UserProfileResponseDto | null> {
  try {
    return await serverApiRequest<UserProfileResponseDto>({
      url: '/auth/profile',
      method: 'GET',
    })
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

export async function requireRole(
  allowedRoles: UserProfileResponseDto['role'][],
): Promise<UserProfileResponseDto> {
  const auth = await requireAuth()
  if (!allowedRoles.includes(auth.role)) {
    redirect('/login')
  }
  return auth
}
