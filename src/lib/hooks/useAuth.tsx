"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { UserProfileResponseDto } from "@/lib/api/generated/schemas";
import {
  authGetProfile,
  authLogin,
  authLogout,
} from "@/lib/api/generated/prescriptionManagementAPI";
import { getRedirectPath, routes } from "@/lib/routes";

interface AuthContextType {
  user: UserProfileResponseDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: UserProfileResponseDto | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileResponseDto | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authLogin({ email, password });
      const profile = await authGetProfile();
      const redirectPath = getRedirectPath(profile.role);
      startTransition(() => {
        setUser(profile);
        if (typeof window !== "undefined") {
          window.location.assign(redirectPath);
          return;
        }
        router.push(redirectPath);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authLogout();
    } finally {
      startTransition(() => {
        setUser(null);
        router.push(routes.login);
      });
      setIsLoading(false);
    }
  };

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
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
