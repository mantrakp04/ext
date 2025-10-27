import React from "react";
import { ThemeProvider } from '@/components/theme-provider';
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';

export function ConvexProvider({ children, forceAuth = true }: { children: React.ReactNode; forceAuth?: boolean }) {
  const persister = experimental_createQueryPersister({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 2,
        refetchOnWindowFocus: false,
        persister: persister.persisterFn,
      },
    },
  });
  
  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, {
    expectAuth: forceAuth,
  });
  
  const convexQueryClient = new ConvexQueryClient(convex);
  convexQueryClient.connect(queryClient);

  const providers = (
    <ThemeProvider>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConvexBetterAuthProvider>
    </ThemeProvider>
  );

  if (!forceAuth) {
    return providers;
  }

  return <AuthWrapper>{providers}</AuthWrapper>;
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  
  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen">
        <Button onClick={async () => {
          const { data } = await authClient.signIn.social({
            provider: "google",
            callbackURL: chrome.runtime.getURL('auth.html'),
            disableRedirect: window.location.pathname === '/sidepanel.html',
          });

          if (data?.url) {
            window.open(data.url, '_blank');
          }
        }}>
          Sign in with Google
        </Button>
        <a className="text-sm text-gray-600" onClick={() => {
          window.location.reload();
        }}>Refresh</a>
        <p className="text-xs text-gray-600 text-center">
          Note: If authentication fails, manually copy and paste the callback URL
        </p>
      </div>
    );
  }

  return <>{children}</>;
} 
