import type { SearchSuggestion } from '@/types';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => {
        console.error('Error setting panel behavior:', error);
      });
  });

  // Handle messages from new tab page
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTopSites") {
      chrome.topSites.get((sites) => {
        sendResponse({ topSites: sites });
      });
      return true;
    }

    if (request.action === "getSearchSuggestions") {
      const query = request.query?.toLowerCase() || '';
      const maxResults = request.maxResults || 5;

      if (!query || query.length < 2) {
        sendResponse({ suggestions: [] });
        return false;
      }

      Promise.all([
        new Promise<chrome.history.HistoryItem[]>((resolve) => {
          chrome.history.search({
            text: query,
            maxResults: maxResults,
            startTime: 0,
          }, (results) => resolve(results || []));
        }),
        new Promise<chrome.bookmarks.BookmarkTreeNode[]>((resolve) => {
          chrome.bookmarks.search(query, (results) => resolve(results || []));
        }),
      ]).then(([historyResults, bookmarkResults]) => {
        const suggestions: SearchSuggestion[] = [
          ...historyResults
            .filter(item => item.url && item.title)
            .map(item => ({
              ...item,
              type: 'history' as const,
            })),
          ...bookmarkResults
            .filter(item => item.url && item.title)
            .map(item => ({
              ...item,
              type: 'bookmark' as const,
            })),
        ]
          .sort((a, b) => {
            if (a.type === 'history' && b.type === 'history') {
              return (b.visitCount || 0) - (a.visitCount || 0);
            }
            if (a.type === 'bookmark' && b.type === 'bookmark') {
              return (b.dateAdded || 0) - (a.dateAdded || 0);
            }
            return a.type === 'history' ? -1 : 1;
          })
          .filter((item, index, self) => 
            index === self.findIndex(t => t.url === item.url)
          )
          .slice(0, maxResults);

        sendResponse({ suggestions });
      }).catch(() => {
        sendResponse({ suggestions: [] });
      });

      return true;
    }
  });
});
