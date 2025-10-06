import { useState, useEffect } from 'react';
import { OpenRouterOAuthService } from '@/lib/openrouter/oauth';

export type AuthStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseOAuthReturn {
  isAuthenticating: boolean;
  authStatus: AuthStatus;
  errorMessage: string;
  startAuth: () => Promise<void>;
  retry: () => void;
}

export function useOAuth(
  onAuthComplete: (apiKey: string) => void,
  onAuthError: (error: string) => void
): UseOAuthReturn {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
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

  const startAuth = async () => {
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

  const retry = () => {
    setAuthStatus('idle');
    setErrorMessage('');
    setIsAuthenticating(false);
  };

  return {
    isAuthenticating,
    authStatus,
    errorMessage,
    startAuth,
    retry,
  };
}

export interface UseApiKeyReturn {
  apiKey: string;
  hasApiKey: boolean;
  handleOAuthComplete: (oauthApiKey: string) => void;
  handleOAuthError: (error: string) => void;
  handleChangeApiKey: () => void;
}

export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Load API key on mount
  useEffect(() => {
    browser.storage.local.get(['openrouter_api_key']).then((result) => {
      if (result.openrouter_api_key) {
        setApiKey(result.openrouter_api_key);
        setHasApiKey(true);
      }
    });
  }, []);

  const handleOAuthComplete = (oauthApiKey: string) => {
    setApiKey(oauthApiKey);
    setHasApiKey(true);
  };

  const handleOAuthError = (error: string) => {
    console.error('OAuth error:', error);
  };

  const handleChangeApiKey = () => {
    setHasApiKey(false);
    setApiKey('');
    browser.storage.local.remove(['openrouter_api_key']);
  };

  return {
    apiKey,
    hasApiKey,
    handleOAuthComplete,
    handleOAuthError,
    handleChangeApiKey,
  };
}
