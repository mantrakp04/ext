import { OpenRouterOAuthService } from '@/lib/openrouter/oauth';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => {
        console.error('Error setting panel behavior:', error);
      });
  });

  // Set up OAuth listener for handling authentication callbacks
  OpenRouterOAuthService.setupOAuthListener();
});
