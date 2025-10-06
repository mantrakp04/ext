import { useState, useEffect } from 'react';

export interface TopSite {
  id: string;
  name: string;
  url: string;
}

export function useTopSites() {
  const [topSites, setTopSites] = useState<TopSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSites = async () => {
      try {
        const response = await new Promise<{ topSites: chrome.topSites.MostVisitedURL[] }>((resolve, reject) => {
          chrome.runtime.sendMessage({ action: "getTopSites" }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        if (response && response.topSites) {
          const formattedSites: TopSite[] = response.topSites.slice(0, 4).map((site: chrome.topSites.MostVisitedURL, index: number) => ({
            id: `site-${index}`,
            name: site.title || new URL(site.url).hostname,
            url: site.url,
          }));
          setTopSites(formattedSites);
        }
      } catch (error) {
        // Silently fail - no top sites to show
      } finally {
        setLoading(false);
      }
    };

    fetchTopSites();
  }, []);

  return { topSites, loading };
}
