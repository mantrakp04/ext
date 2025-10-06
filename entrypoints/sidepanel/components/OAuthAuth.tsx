import { Sparkles, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useOAuth } from '../hooks/oauth';

interface OAuthAuthProps {
  onAuthComplete: (apiKey: string) => void;
  onAuthError: (error: string) => void;
}

export function OAuthAuth({ onAuthComplete, onAuthError }: OAuthAuthProps) {
  const { isAuthenticating, authStatus, errorMessage, startAuth, retry } = useOAuth(
    onAuthComplete,
    onAuthError
  );

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <Sparkles className="w-16 h-16 mx-auto text-primary" />
            {authStatus === 'success' && (
              <CheckCircle className="w-6 h-6 absolute -top-1 -right-1 text-green-500" />
            )}
            {authStatus === 'error' && (
              <AlertCircle className="w-6 h-6 absolute -top-1 -right-1 text-red-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Connect to OpenRouter for secure AI access
            </p>
          </div>
        </div>

        {authStatus === 'idle' && (
          <div className="space-y-4">
            <button
              onClick={startAuth}
              disabled={isAuthenticating}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Connect with OpenRouter
            </button>

            <p className="text-xs text-muted-foreground text-center">
              You'll be redirected to OpenRouter to authorize this extension
            </p>
          </div>
        )}

        {authStatus === 'pending' && (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              <h3 className="font-semibold">Authenticating...</h3>
              <p className="text-sm text-muted-foreground">
                Please complete the authorization in the new tab
              </p>
            </div>
          </div>
        )}

        {authStatus === 'success' && (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
              <h3 className="font-semibold text-green-700 dark:text-green-400">
                Authentication Successful!
              </h3>
              <p className="text-sm text-muted-foreground">
                You're now connected to OpenRouter
              </p>
            </div>
          </div>
        )}

        {authStatus === 'error' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
              <h3 className="font-semibold text-red-700 dark:text-red-400">
                Authentication Failed
              </h3>
              <p className="text-sm text-muted-foreground">
                {errorMessage || 'An error occurred during authentication'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={retry}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
