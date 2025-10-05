import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { settingsAtom, type QuickLink } from '../store/settings';

interface AddLinkFormProps {
  onCancel?: () => void;
}

// Function to extract domain name from URL
const getDomainName = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
};

export function AddLinkForm({ onCancel }: AddLinkFormProps) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [newLink, setNewLink] = useState({ name: '', url: '' });

  // Auto-update name from URL when URL changes
  useEffect(() => {
    if (newLink.url) {
      const domainName = getDomainName(newLink.url);
      if (domainName) {
        setNewLink(prev => ({ ...prev, name: domainName }));
      }
    }
  }, [newLink.url]);

  const handleAdd = () => {
    if (newLink.url) {
      const finalName = newLink.name || getDomainName(newLink.url) || 'Untitled Link';
      const linkToAdd: QuickLink = {
        ...newLink,
        name: finalName,
        id: Date.now().toString()
      };
      
      setSettings(prev => ({ 
        ...prev, 
        quickLinks: [...prev.quickLinks, linkToAdd] 
      }));
      
      setNewLink({ name: '', url: '' });
      onCancel?.();
    }
  };

  const handleCancel = () => {
    setNewLink({ name: '', url: '' });
    onCancel?.();
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
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
