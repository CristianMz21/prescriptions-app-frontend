import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { UserProfileResponseDto } from '@/lib/api/generated/schemas'
import { API_BASE_URL } from '@/lib/api/client'

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/profile']

function isAuthRequest(url?: string): boolean {
  if (!url) return false
  return AUTH_ENDPOINTS.some((path) => url.includes(path))
}

async function buildCookieHeader(): Promise<string> {
  const store = await cookies()
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}

interface RawCookie {
  name: string
  value: string
  path?: string
  expires?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
}

/** Best-effort parser for backend Set-Cookie headers — we only need name/value
 *  + a few attributes to round-trip cookies through next/headers cookies(). */
function parseSetCookie(raw: string): RawCookie | null {
  const [pair, ...attrs] = raw.split(';').map((s) => s.trim())
  const eq = pair.indexOf('=')
  if (eq < 0) return null
  const cookie: RawCookie = { name: pair.slice(0, eq), value: pair.slice(eq + 1) }
  for (const attr of attrs) {
    const [k, v = ''] = attr.split('=')
    const key = k.toLowerCase()
    if (key === 'path') cookie.path = v
    else if (key === 'expires') cookie.expires = v
    else if (key === 'max-age') cookie.maxAge = Number(v)
    else if (key === 'httponly') cookie.httpOnly = true
    else if (key === 'secure') cookie.secure = true
    else if (key === 'samesite') cookie.sameSite = v.toLowerCase() as RawCookie['sameSite']
  }
  return cookie
}

async function persistSetCookies(setCookieHeaders: string[] | undefined) {
  if (!setCookieHeaders || setCookieHeaders.length === 0) return
  const store = await cookies()
  for (const raw of setCookieHeaders) {
    const c = parseSetCookie(raw)
    if (!c) continue
    store.set({
      name: c.name,
      value: c.value,
      path: c.path ?? '/',
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite,
      maxAge: c.maxAge,
    })
  }
}

async function attemptRefresh(): Promise<boolean> {
  const cookieHeader = await buildCookieHeader()
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        validateStatus: () => true,
      },
    )
    if (res.status >= 200 && res.status < 300) {
      const setCookies = (res.headers['set-cookie'] as string[] | undefined) ?? undefined
      await persistSetCookies(setCookies)
      return true
    }
    return false
  } catch {
    return false
  }
}

async function rawRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const cookieHeader = await buildCookieHeader()
  return axios.request<T>({
    baseURL: API_BASE_URL,
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers ?? {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    validateStatus: () => true,
  })
}

export async function serverApiRequest<T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> {
  let response = await rawRequest<T>(config)

  if (response.status === 401 && !isAuthRequest(config.url)) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      response = await rawRequest<T>(config)
    }
  }

  if (response.status >= 200 && response.status < 300) {
    return response.data
  }

  throw new AxiosError(
    `Request failed with status ${response.status}`,
    String(response.status),
    config as never,
    undefined,
    response,
  )
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
