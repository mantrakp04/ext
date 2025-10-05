import { atomWithStorage } from 'jotai/utils';

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface Settings {
  userName: string;
  theme: 'light' | 'dark' | 'system';
  searchEngine: 'unduck' | 'google' | 'bing' | 'duckduckgo';
  showGreeting: boolean;
  showDate: boolean;
  showTime: boolean;
  showQuickLinks: boolean;
  quickLinksPerRow: 2 | 3 | 4 | 5 | 6;
  quickLinks: QuickLink[];
}

export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
};

const defaultQuickLinks: QuickLink[] = [
  { id: '1', name: 'Gmail', url: 'https://gmail.com' },
  { id: '2', name: 'GitHub', url: 'https://github.com' },
  { id: '3', name: 'YouTube', url: 'https://youtube.com' },
  { id: '4', name: 'Twitter', url: 'https://twitter.com' },
].map(link => ({
  icon: getFaviconUrl(link.url),
  ...link
}));

export const defaultSettings: Settings = {
  userName: '',
  theme: 'system',
  searchEngine: 'unduck',
  showGreeting: true,
  showDate: true,
  showTime: true,
  showQuickLinks: true,
  quickLinksPerRow: 4,
  quickLinks: defaultQuickLinks,
};

export const searchEngines = {
  unduck: {
    name: 'Unduck',
    url: 'https://unduck.link?q=',
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
  },
};

export const settingsAtom = atomWithStorage<Settings>('settings', defaultSettings);
