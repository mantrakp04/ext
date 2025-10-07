import React, { useEffect } from "react";
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, {
  expectAuth: true, 
});

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <QueryProvider>
      <ThemeProvider>
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          {session ? children : (
            <div className="flex flex-col gap-4 items-center justify-center h-screen">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">Please sign in to continue</h2>
              </div>
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
            </div>
          )}
        </ConvexBetterAuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
} 

export function SignOutButton() {
  return (
    <Button onClick={async () => {
      await authClient.signOut();
    }}>
      Sign out
    </Button>
  );
}
