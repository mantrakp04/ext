import { atomWithStorage } from 'jotai/utils';

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  searchEngine: 'unduck' | 'google' | 'bing' | 'duckduckgo';
  showDateTime: boolean;
  showQuickLinks: boolean;
  showNotes: boolean;
  showWeather: boolean;
  weatherLocation: string;
  notes: string;
  quickLinks: QuickLink[];
  backgroundImage: string;
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
  theme: 'system',
  searchEngine: 'unduck',
  showDateTime: true,
  showQuickLinks: true,
  showNotes: true,
  showWeather: true,
  weatherLocation: 'Vancouver',
  notes: '',
  quickLinks: defaultQuickLinks,
  backgroundImage: '',
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

export const stockBackgroundImages = [
  {
    id: 'forest-light',
    name: 'Forest Light',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    theme: 'light'
  },
  {
    id: 'forest-dark',
    name: 'Forest Dark',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    theme: 'dark'
  },
  {
    id: 'mountain-sunset',
    name: 'Mountain Sunset',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    theme: 'dark'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
    theme: 'light'
  },
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    theme: 'light'
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    theme: 'dark'
  },
  {
    id: 'cherry-blossoms',
    name: 'Cherry Blossoms',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2056&q=80',
    theme: 'light'
  },
  {
    id: 'space-nebula',
    name: 'Space Nebula',
    url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    theme: 'dark'
  },
  {
    id: 'tropical-beach',
    name: 'Tropical Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
    theme: 'light'
  }
];

export const settingsAtom = atomWithStorage<Settings>('settings', defaultSettings);
