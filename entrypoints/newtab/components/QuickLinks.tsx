import { useState } from 'react';
import { useAtom } from 'jotai';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { settingsAtom } from '../store/settings';
import { AddLinkForm } from './AddLinkForm';

export function QuickLinks() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [showAddForm, setShowAddForm] = useState(false);

if (!settings.showQuickLinks) return null;

  const removeLink = (id: string) => {
    setSettings(prev => ({ ...prev, quickLinks: prev.quickLinks.filter((link) => link.id !== id) }));
  };

  return (
    <div className="w-full">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {settings.quickLinks.map((link) => (
          <Button 
            key={link.id}
            variant="outline" 
            size="sm" 
            className='justify-between px-1 group'
            onClick={() => window.open(link.url, '_blank')}
          >
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <img src={link.icon} alt={link.name} className="w-6 h-6 rounded-sm flex-shrink-0" />
              <span className="truncate">{link.name}</span>
            </div>
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
          </Button>
        ))}
        
        {showAddForm ? (
          <AddLinkForm 
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="justify-center px-1 border-dashed"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
