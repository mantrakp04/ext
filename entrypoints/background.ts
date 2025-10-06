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

  // Handle topSites requests from new tab page
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTopSites") {
      chrome.topSites.get((sites) => {
        sendResponse({ topSites: sites });
      });
      return true; // Indicates async response
    }
  });
});
