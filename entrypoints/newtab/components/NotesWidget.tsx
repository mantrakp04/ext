import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { settingsAtom } from '../store/settings';

export function NotesWidget() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [tempNote, setTempNote] = useState(settings.notes || '');

  const handleSave = () => {
    setSettings(prev => ({ ...prev, notes: tempNote }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNote(settings.notes || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };


  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {isEditing ? (
          <>
            <AutosizeTextarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your notes here..."
              className="flex-1 resize-none border-none p-0 focus-visible:ring-0 text-sm"
              autoFocus
            />
            <div className="flex gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-6 px-2"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {settings.notes ? (
              <p className="text-sm whitespace-pre-wrap">{settings.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Click edit to add notes...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
