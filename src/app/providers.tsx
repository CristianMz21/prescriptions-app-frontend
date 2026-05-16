"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { ClientToaster } from "@/components/providers/ClientToaster";
import { GlobalLoadingIndicator } from "@/components/feedback/GlobalLoadingIndicator";
import type { UserProfileResponseDto } from "@/lib/api/generated/schemas";

interface ProvidersProps {
  children: React.ReactNode;
  initialUser: UserProfileResponseDto | null;
}

export function Providers({ children, initialUser }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* `useSearchParams()` inside the indicator requires a Suspense
          boundary in Next 16. Keep it tight so any indicator hang
          can't block the rest of the tree. */}
      <Suspense fallback={null}>
        <GlobalLoadingIndicator />
      </Suspense>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      <ClientToaster />
    </QueryClientProvider>
  );
}
