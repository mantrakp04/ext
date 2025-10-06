import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { Plus, Mic, ArrowUp, History, Bookmark } from 'lucide-react';
import { AutosizeTextarea, AutosizeTextAreaRef } from '@/components/ui/autosize-textarea';
import { settingsAtom, searchEngines } from '../store/settings';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { cn } from '@/lib/utils';
import type { SearchSuggestion } from '@/types';

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return '';
  }
};

// Suggestion item component
interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function SuggestionItem({ suggestion, isSelected, onSelect, onHover }: SuggestionItemProps) {
  const handleClick = () => {
    if (suggestion.url) {
      window.location.href = suggestion.url;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-accent",
        isSelected && "bg-accent"
      )}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        {suggestion.type === 'history' ? (
          <>
            <img
              src={getFaviconUrl(suggestion.url || '')}
              alt=""
              className="size-4 rounded-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <History className="size-4 hidden" />
          </>
        ) : (
          <Bookmark className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{suggestion.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {suggestion.url}
        </div>
      </div>
    </button>
  );
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [settings] = useAtom(settingsAtom);
  const textareaRef = useRef<AutosizeTextAreaRef>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { suggestions } = useSearchSuggestions(searchQuery);

  useEffect(() => {
    if (settings.autoFocusSearchBar && textareaRef.current?.textArea) {
      textareaRef.current.textArea.focus();
    }
  }, [settings.autoFocusSearchBar]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Update suggestions visibility based on query and focus
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && isFocused);
  }, [suggestions, isFocused]);


  const handleSearch = (e: React.FormEvent, url?: string) => {
    e.preventDefault();
    
    if (url) {
      window.location.href = url;
      return;
    }

    if (selectedIndex >= 0 && suggestions[selectedIndex]?.url) {
      window.location.href = suggestions[selectedIndex].url!;
      return;
    }

    if (searchQuery.trim()) {
      const searchUrl = searchQuery.startsWith('http')
        ? searchQuery
        : `${searchEngines[settings.searchEngine].url}${encodeURIComponent(searchQuery)}`;
      window.location.href = searchUrl;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (!e.shiftKey) {
          e.preventDefault();
          handleSearch(e);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1);
        break;
    }
  };

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="relative flex flex-col w-full">
      <form onSubmit={handleSearch} className="w-full">
        <div className={cn(
          "flex h-full gap-2 rounded-4xl bg-card p-2 shadow-md transition-transform duration-200 ease-out",
          isFocused && "scale-105"
        )}>
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
              ref={textareaRef}
              placeholder="Search the web or enter a URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                setShowSuggestions(false);
              }}
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

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl bg-card shadow-lg border">
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={`${suggestion.type}-${suggestion.url}`}
              suggestion={suggestion}
              isSelected={selectedIndex === index}
              onSelect={() => setSelectedIndex(index)}
              onHover={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
