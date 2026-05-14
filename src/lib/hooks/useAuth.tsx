'use client'

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { UserProfileResponseDto, Role } from '@/lib/api/generated/schemas'
import {
  authControllerGetProfile,
  authControllerLogin,
  authControllerLogout,
} from '@/lib/api/generated/prescriptionManagementAPI'

interface AuthContextType {
  user: UserProfileResponseDto | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getRedirectPath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/metrics'
    case 'DOCTOR':
      return '/doctor/prescriptions'
    case 'PATIENT':
      return '/patient/prescriptions'
    default:
      return '/login'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfileResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [, startTransition] = useTransition()

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await api.authControllerLogin({ email, password })
      const response = await api.authControllerGetProfile()
      startTransition(() => {
        setUser(response.data)
        const redirectPath = getRedirectPath(response.data.role)
        router.push(redirectPath)
      })
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await api.authControllerLogout()
    } finally {
      startTransition(() => {
        setUser(null)
        router.push('/login')
      })
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}