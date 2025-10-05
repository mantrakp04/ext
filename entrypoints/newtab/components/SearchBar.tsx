import { useState } from 'react';
import { useAtom } from 'jotai';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { settingsAtom, searchEngines } from '../store/settings';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [settings] = useAtom(settingsAtom);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = searchQuery.startsWith('http')
        ? searchQuery
        : `${searchEngines[settings.searchEngine].url}${encodeURIComponent(searchQuery)}`;
      window.location.href = searchUrl;
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search the web or enter a URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 sm:h-14 text-base sm:text-lg"
        />
      </div>
    </form>
  );
}
