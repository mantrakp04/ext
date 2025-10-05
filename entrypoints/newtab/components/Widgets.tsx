import { ReactNode } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom } from '../store/settings';
import { TimeWidget } from './TimeWidget';
import { NotesWidget } from './NotesWidget';
import { WeatherWidgetSquare } from './WeatherWidget';

export type WidgetSize = 'square' | 'rectangle';

export type WidgetType = 'time' | 'notes' | 'weather' | 'stocks';

export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  config: Record<string, any>;
  isVisible: () => boolean;
}

const renderWidget = (widget: Widget): ReactNode => {
  switch (widget.type) {
    case 'time':
      return <TimeWidget timezone={widget.config.timezone} />;
    case 'notes':
      return <NotesWidget id={widget.id} notes={widget.config.notes || ''} />;
    case 'weather':
      return <WeatherWidgetSquare location={widget.config.location || 'Vancouver'} />;
    case 'stocks':
      // TODO: Implement stocks widget
      return (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Stocks widget coming soon</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Unknown widget type</p>
          </div>
        </div>
      );
  }
};

export function Widgets() {
  const [settings] = useAtom(settingsAtom);
  const widgets = settings.widgets || [];
  
  const visibleWidgets = widgets.filter(widget => widget.isVisible());
  
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
  
  return (
    <div 
      className="grid gap-2 grid-cols-4"
    >
      {displayWidgets.map((widget) => (
        <div
          key={widget.id}
          className={`
            ${widget.size === 'square' ? 'col-span-1' : 'col-span-2'}
            h-40
          `}
        >
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
}
