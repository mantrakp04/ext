import { 
  generatePKCEPair, 
  buildOpenRouterAuthUrl, 
  extractAuthCodeFromUrl, 
  exchangeCodeForApiKey 
} from './utils';

export interface OAuthState {
  codeVerifier: string;
  codeChallenge: string;
  callbackUrl: string;
}

export class OpenRouterOAuthService {
  private static readonly STORAGE_KEY = 'openrouter_oauth_state';
  private static readonly CALLBACK_URL = 'http://localhost:3000/auth/callback';

  static async startOAuthFlow(): Promise<void> {
    try {
      // Generate PKCE pair
      const { codeVerifier, codeChallenge } = await generatePKCEPair();
      
      // Store state for later verification
      const oauthState: OAuthState = {
        codeVerifier,
        codeChallenge,
        callbackUrl: this.CALLBACK_URL,
      };
      
      await browser.storage.local.set({ [this.STORAGE_KEY]: oauthState });
      
      // Build and navigate to OpenRouter auth URL
      const authUrl = buildOpenRouterAuthUrl(this.CALLBACK_URL, codeChallenge);
      
      // Open in new tab
      await browser.tabs.create({ url: authUrl });
      
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      throw new Error('Failed to start authentication process');
    }
  }

  static async completeOAuthFlow(url: string): Promise<string> {
    try {
      // Extract code from URL
      const code = extractAuthCodeFromUrl(url);
      if (!code) {
        throw new Error('No authorization code found in URL');
      }

      // Retrieve stored OAuth state
      const result = await browser.storage.local.get([this.STORAGE_KEY]);
      const oauthState: OAuthState = result[this.STORAGE_KEY];
      
      if (!oauthState) {
        throw new Error('OAuth state not found. Please restart the authentication process.');
      }

      // Exchange code for API key
      const apiKey = await exchangeCodeForApiKey(
        code,
        oauthState.codeVerifier,
        'S256'
      );

      // Clean up OAuth state
      await browser.storage.local.remove([this.STORAGE_KEY]);

      return apiKey;
    } catch (error) {
      console.error('Failed to complete OAuth flow:', error);
      throw error;
    }
  }

  static async hasPendingOAuthFlow(): Promise<boolean> {
    const result = await browser.storage.local.get([this.STORAGE_KEY]);
    return !!result[this.STORAGE_KEY];
  }

  static async clearOAuthState(): Promise<void> {
    await browser.storage.local.remove([this.STORAGE_KEY]);
  }

  static setupOAuthListener(): void {
    // Listen for tab updates to detect OAuth callback
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is our OAuth callback
        if (tab.url.includes(this.CALLBACK_URL) && tab.url.includes('code=')) {
          try {
            const apiKey = await this.completeOAuthFlow(tab.url);
            
            // Store the API key
            await browser.storage.local.set({ openrouter_api_key: apiKey });
            
            // Close the OAuth tab
            await browser.tabs.remove(tabId);
            
            // Notify the side panel that authentication is complete
            await this.notifyAuthComplete(apiKey);
            
          } catch (error) {
            console.error('OAuth completion failed:', error);
            await browser.tabs.remove(tabId);
            await this.notifyAuthError(error instanceof Error ? error.message : 'Unknown error');
          }
        }
      }
    });
  }

  private static async notifyAuthComplete(apiKey: string): Promise<void> {
    try {
      // Send message to side panel
      await browser.runtime.sendMessage({
        type: 'OAUTH_COMPLETE',
        apiKey,
      });
    } catch (error) {
      console.error('Failed to notify auth completion:', error);
    }
  }

  private static async notifyAuthError(errorMessage: string): Promise<void> {
    try {
      await browser.runtime.sendMessage({
        type: 'OAUTH_ERROR',
        error: errorMessage,
      });
    } catch (error) {
      console.error('Failed to notify auth error:', error);
    }
  }
}
