import { useState } from 'react';
import { useAtom } from 'jotai';
import { Plus, Mic, ArrowUp } from 'lucide-react';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { settingsAtom, searchEngines } from '../store/settings';
import { cn } from '@/lib/utils';

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

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex h-full gap-2 rounded-4xl bg-card p-2 shadow-md">
        {/* Add button */}
        <div className="flex h-full items-end justify-center">
          <button
            type="button"
            className={cn(
              "mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              "hover:bg-primary/80",
              hasQuery ? "bg-primary/80" : "bg-accent"
            )}
            aria-label="Add files and more"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {/* Textarea container */}
        <div className="flex-1">
          <AutosizeTextarea
            placeholder="Search the web or enter a URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "resize-none border-none bg-transparent pt-3.5 text-sm leading-relaxed",
              "placeholder:text-muted-foreground focus-visible:outline-none",
              hasQuery && "bg-primary/10"
            )}
            minHeight={36}
            maxHeight={208}
          />
        </div>

        {/* Action buttons */}
        <div className="flex h-full items-end gap-1">
          <button
            type="button"
            className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent"
            aria-label="Voice input"
          >
            <Mic className="size-5" />
          </button>
          <button
            type="submit"
            disabled={!hasQuery}
            className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-30"
            aria-label="Search"
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
