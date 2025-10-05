import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { settingsAtom, getFaviconUrl, type QuickLink } from '../store/settings';

interface AddLinkFormProps {
  onCancel: () => void;
}

export function AddLinkForm({ onCancel }: AddLinkFormProps) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [newLink, setNewLink] = useState({ name: '', url: '', icon: '🔗' });

  const handleAdd = () => {
    if (newLink.name && newLink.url) {
      const linkToAdd: QuickLink = {
        ...newLink,
        id: Date.now().toString(),
        icon: newLink.icon || getFaviconUrl(newLink.url)
      };
      
      setSettings(prev => ({ 
        ...prev, 
        quickLinks: [...prev.quickLinks, linkToAdd] 
      }));
      
      setNewLink({ name: '', url: '', icon: '🔗' });
      onCancel();
    }
  };

  const handleCancel = () => {
    setNewLink({ name: '', url: '', icon: '🔗' });
    onCancel();
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2">
        <AutosizeTextarea
          placeholder="Name"
          value={newLink.name}
          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
          className="h-8 text-sm min-h-[32px] max-h-[120px] resize-none"
          minHeight={32}
          maxHeight={120}
        />
        <AutosizeTextarea
          placeholder="URL"
          value={newLink.url}
          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          className="h-8 text-sm min-h-[32px] max-h-[120px] resize-none"
          minHeight={32}
          maxHeight={120}
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleAdd} className="flex-1 h-7 text-xs">
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="flex-1 h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
