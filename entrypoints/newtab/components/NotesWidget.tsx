import { useState, useEffect, useRef, useCallback } from 'react';
import { Edit3 } from 'lucide-react';
import { Widget, WidgetContent } from './WidgetCard';
import { Widget as WidgetType } from './Widgets';

export function NotesWidget({ props }: { props: {
  widget: WidgetType,
  onRemove: (widgetId: string) => void,
  onConfigChange: (widgetId: string, config: Record<string, any>) => void
}}) {
  const { widget, onRemove, onConfigChange } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [localNotes, setLocalNotes] = useState(widget.config.notes || '');
  const cardRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startEditing = () => setIsEditing(true);
  const stopEditing = () => setIsEditing(false);

  // Debounced function to save notes
  const debouncedSaveNotes = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onConfigChange(widget.id, { ...widget.config, notes: value });
    }, 500); // 500ms debounce
  }, [onConfigChange, widget.id, widget.config]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      stopEditing();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      stopEditing();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalNotes(value);
    debouncedSaveNotes(value);
  };

  // Update local notes when widget config changes externally
  useEffect(() => {
    setLocalNotes(widget.config.notes || '');
  }, [widget.config.notes]);

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

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Widget widget={widget} onRemove={onRemove}>
      <WidgetContent>
        <div 
          ref={cardRef}
          className="h-full w-full flex flex-col cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
            {!isEditing && <Edit3 className="h-3 w-3 text-muted-foreground" />}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {isEditing ? (
              <textarea
                value={localNotes}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={stopEditing}
                placeholder="Write your notes here..."
                className="flex-1 resize-none border-none p-0 focus-visible:ring-0 text-sm bg-transparent outline-none min-h-0 whitespace-pre-wrap break-words leading-relaxed"
                autoFocus
              />
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                {localNotes ? (
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {localNotes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Click to add notes...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </WidgetContent>
    </Widget>
  );
}