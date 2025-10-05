import { ReactNode } from 'react';

export type WidgetType = 'square' | 'rectangle';

export interface Widget {
  id: string;
  type: WidgetType;
  component: ReactNode;
  isVisible: () => boolean;
}

interface WidgetsProps {
  widgets: Widget[];
}

export function Widgets({ widgets }: WidgetsProps) {
  const visibleWidgets = widgets.filter(widget => widget.isVisible());
  
  return (
    <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
      {visibleWidgets.map((widget) => (
        <div
          key={widget.id}
          className={`
            ${widget.type === 'square' ? 'aspect-square' : 'aspect-[2/1]'}
            ${widget.type === 'square' ? 'col-span-1' : 'col-span-2'}
            ${widget.type === 'rectangle' ? 'row-span-1' : ''}
          `}
        >
          {widget.component}
        </div>
      ))}
    </div>
  );
}
