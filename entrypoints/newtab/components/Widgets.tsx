import { ReactNode } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom } from '../store/settings';
import { TimeWidget } from './TimeWidget';
import { NotesWidget } from './NotesWidget';
import { WeatherWidgetSquare } from './WeatherWidget';
import { StockWidget } from './StockWidget';

export type WidgetSize = 'square' | 'rectangle';

export type WidgetType = 'time' | 'notes' | 'weather' | 'stocks';

export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  config: Record<string, any>;
  isVisible: boolean;
}

const renderWidget = ({
  widget,
  onRemove,
  onConfigChange,
}: {
  widget: Widget;
  onRemove: (widgetId: string) => void;
  onConfigChange: (widgetId: string, config: Record<string, any>) => void;
}): ReactNode => {
  switch (widget.type) {
    case 'time':
      return <TimeWidget props={{ widget, onRemove, onConfigChange }} />;
    case 'notes':
      return <NotesWidget props={{ widget, onRemove, onConfigChange }} />;
    case 'weather':
      return <WeatherWidgetSquare props={{ widget, onRemove, onConfigChange }} />;
    case 'stocks':
      return <StockWidget props={{ widget, onRemove, onConfigChange }} />;
    default:
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Unknown widget type</p>
          </div>
        </div>
      );
  }
};

export function Widgets() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const widgets = settings.widgets || [];
  
  const visibleWidgets = widgets.filter(widget => widget.isVisible);
  
  const calculateGridUnits = () => {
    let totalUnits = 0;
    const limitedWidgets = [];
    
    for (const widget of visibleWidgets) {
      const widgetUnits = widget.size === 'square' ? 1 : 2;
      
      // Check if adding this widget would exceed the 12-unit limit
      if (totalUnits + widgetUnits <= 12) {
        totalUnits += widgetUnits;
        limitedWidgets.push(widget);
      } else {
        // Stop adding widgets if we would exceed the limit
        break;
      }
    }
    
    return limitedWidgets;
  };

  const displayWidgets = calculateGridUnits();

  const handleRemoveWidget = (widgetId: string) => {
    setSettings(prev => ({
      ...prev,
      widgets: (prev.widgets || []).filter(widget => widget.id !== widgetId)
    }));
  };

  const handleConfigChange = (widgetId: string, config: Record<string, any>) => {
    setSettings(prev => ({
      ...prev,
      widgets: (prev.widgets || []).map(widget =>
        widget.id === widgetId
          ? { ...widget, config }
          : widget
      )
    }));
  };
  
  return (
    <div 
      className="grid gap-2 grid-cols-4 w-full"
    >
      {displayWidgets.map((widget) => (
        <div
          key={widget.id}
          className={`
            ${widget.size === 'square' ? 'col-span-1' : 'col-span-2'}
            h-40
          `}
        >
          {renderWidget({
            widget,
            onRemove: handleRemoveWidget,
            onConfigChange: handleConfigChange,
          })}
        </div>
      ))}
    </div>
  );
}
