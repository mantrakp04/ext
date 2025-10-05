import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { Edit3 } from 'lucide-react';
import { settingsAtom, defaultSettings } from '../store/settings';

export function NotesWidget({ id, notes }: { id: string, notes: string }) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const startEditing = () => setIsEditing(true);
  const stopEditing = () => setIsEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      stopEditing();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      stopEditing();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings(prev => {
      const currentSettings = typeof prev === 'object' && 'widgets' in prev ? prev : defaultSettings;
      return {
        ...currentSettings,
        widgets: (currentSettings.widgets || []).map((widget) =>
          widget.id === id
            ? { ...widget, config: { ...widget.config, notes: e.target.value } }
            : widget
        )
      };
    });
  };

  const handleCardClick = () => {
    if (!isEditing) startEditing();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        stopEditing();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  return (
    <div 
      ref={cardRef}
      className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
        {!isEditing && <Edit3 className="h-3 w-3 text-muted-foreground" />}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {isEditing ? (
          <textarea
            value={notes}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={stopEditing}
            placeholder="Write your notes here..."
            className="flex-1 resize-none border-none p-0 focus-visible:ring-0 text-sm bg-transparent outline-none min-h-0"
            style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}
            autoFocus
          />
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
            {notes ? (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Click to add notes...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
