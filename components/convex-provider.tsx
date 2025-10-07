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

  useEffect(() => {
    const handleOAuthCallback = async (message: any) => {
      if (message.action === 'oauthCallback') {
        console.log('Received OAuth callback:', message.data);
        
        try {
          // Extract the URL and parse the ott parameter
          const callbackUrl = message.data;
          const url = new URL(callbackUrl);
          const ott = url.searchParams.get('ott');
          
          if (ott) {
            const response = await fetch(`${import.meta.env.VITE_CONVEX_SITE_URL}/api/auth/callback/google?ott=${ott}`, {
              method: 'GET',
              credentials: 'include',
            });

            console.log('OAuth callback response:', response);
            
            if (response.ok) {
              chrome.windows.getAll((windows) => {
                windows.forEach((window) => {
                  if (window.tabs?.[0]?.url?.includes('localhost/ext/callback')) {
                    chrome.windows.remove(window.id!);
                  }
                });
              });
            } else {
              console.error('Failed to process OAuth callback:', response.statusText);
            }
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleOAuthCallback);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleOAuthCallback);
    };
  }, []);

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
