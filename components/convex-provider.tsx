import React from "react";
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthClient } from "@convex-dev/better-auth/react";

export function ConvexProvider({ children, forceAuth = true }: { children: React.ReactNode; forceAuth?: boolean }) {
  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, {
    expectAuth: true,
  });

  const providers = (
    <QueryProvider>
      <ThemeProvider>
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          {children}
        </ConvexBetterAuthProvider>
      </ThemeProvider>
    </QueryProvider>
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
