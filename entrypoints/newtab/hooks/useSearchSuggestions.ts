import { useState, useEffect } from 'react';
import type { SearchSuggestion } from '@/types';

export function useSearchSuggestions(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || query.length < 2 || query.startsWith('http')) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await new Promise<{ suggestions: SearchSuggestion[] }>((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'getSearchSuggestions',
            query: query,
            maxResults: 5,
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        if (response && response.suggestions) {
          setSuggestions(response.suggestions);
        }
      } catch (error) {
        // Silently fail - no suggestions to show
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [query, enabled]);

  return { suggestions, loading };
}
