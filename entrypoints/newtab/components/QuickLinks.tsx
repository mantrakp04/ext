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
      <div className="grid gap-2 grid-cols-4">
        {settings.quickLinks.map((link) => (
          <Button
            key={link.id}
            variant="outline"
            size="sm"
            className='px-1 group !bg-card hover:!bg-accent cursor-pointer'
            onClick={() => window.open(link.url, '_blank')}
          >
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <img src={getFaviconUrl(link.url)} alt={link.name} className="w-5 h-5 rounded-sm flex-shrink-0" />
              <span className="truncate text-sm font-medium">{link.name}</span>
            </div>
            <div
              className='w-4 h-4 rounded-sm group-hover:bg-destructive group-hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                removeLink(link.id);
              }}
            >
              <X className="size-3" />
            </div>
          </Button>
        ))}
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-center px-1 border-dashed !bg-card hover:!bg-accent cursor-pointer"
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
