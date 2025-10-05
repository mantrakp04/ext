import { useState } from 'react';
import { useAtom } from 'jotai';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { settingsAtom, getFaviconUrl } from '../store/settings';
import { AddLinkForm } from './AddLinkForm';

export function QuickLinks() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [open, setOpen] = useState(false);

if (!settings.showQuickLinks) return null;

  const removeLink = (id: string) => {
    setSettings(prev => ({ ...prev, quickLinks: prev.quickLinks.filter((link) => link.id !== id) }));
  };

  return (
    <div className="w-full">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {settings.quickLinks.map((link) => (
          <div 
            key={link.id}
            className='relative flex items-center justify-between px-1 group h-8 rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-all'
          >
            <button
              className='flex items-center gap-2 min-w-0 flex-1 h-full px-2 rounded-md outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
              onClick={() => window.open(link.url, '_blank')}
            >
              <img src={getFaviconUrl(link.url)} alt={link.name} className="w-6 h-6 rounded-sm flex-shrink-0" />
              <span className="truncate text-sm font-medium">{link.name}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className='w-4 h-4 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={(e) => {
                e.stopPropagation();
                removeLink(link.id);
              }}
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-center px-1 border-dashed"
            >
              <Plus className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <AddLinkForm onCancel={() => setOpen(false)} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
