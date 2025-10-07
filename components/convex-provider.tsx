import React from "react";
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
                  callbackURL: 'http://localhost/ext/callback',
                  disableRedirect: true,
                });
                console.log(data);
                const url = data?.url;
                if (url) {
                  chrome.windows.create({
                    url: url,
                    type: 'popup',
                    width: 500,
                    height: 600,
                    left: 100,
                    top: 100
                  });
                }
              }}>
                Sign in with Google
              </Button>
            </div>
          )}
        </ConvexBetterAuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
} 
