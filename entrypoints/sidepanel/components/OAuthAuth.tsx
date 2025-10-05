import { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { OpenRouterOAuthService } from '@/lib/openrouter-oauth';

interface OAuthAuthProps {
  onAuthComplete: (apiKey: string) => void;
  onAuthError: (error: string) => void;
}

export function OAuthAuth({ onAuthComplete, onAuthError }: OAuthAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Check if there's a pending OAuth flow
    const checkPendingAuth = async () => {
      const hasPending = await OpenRouterOAuthService.hasPendingOAuthFlow();
      if (hasPending) {
        setAuthStatus('pending');
        setIsAuthenticating(true);
      }
    };

    checkPendingAuth();

    // Listen for OAuth completion messages
    const handleMessage = (message: any) => {
      if (message.type === 'OAUTH_COMPLETE') {
        setAuthStatus('success');
        setIsAuthenticating(false);
        setTimeout(() => {
          onAuthComplete(message.apiKey);
        }, 1000);
      } else if (message.type === 'OAUTH_ERROR') {
        setAuthStatus('error');
        setErrorMessage(message.error);
        setIsAuthenticating(false);
        onAuthError(message.error);
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, [onAuthComplete, onAuthError]);

  const handleStartAuth = async () => {
    try {
      setIsAuthenticating(true);
      setAuthStatus('pending');
      setErrorMessage('');
      
      await OpenRouterOAuthService.startOAuthFlow();
    } catch (error: any) {
      setAuthStatus('error');
      setErrorMessage(error.message || 'Failed to start authentication');
      setIsAuthenticating(false);
      onAuthError(error.message || 'Failed to start authentication');
    }
  };

  const handleRetry = () => {
    setAuthStatus('idle');
    setErrorMessage('');
    setIsAuthenticating(false);
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <Sparkles className="w-16 h-16 mx-auto text-primary" />
            {authStatus === 'pending' && (
              <Loader2 className="w-6 h-6 absolute -top-1 -right-1 animate-spin text-primary" />
            )}
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
              onClick={handleStartAuth}
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
            
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                A new tab has opened for authentication. Complete the process there and return here.
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
                onClick={handleRetry}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => {
                  // Fallback to manual API key entry
                  onAuthError('manual_fallback');
                }}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
              >
                Enter API Key Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
