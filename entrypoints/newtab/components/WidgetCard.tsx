import { ReactNode, useState } from 'react';
import { MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { Widget as WidgetType } from './Widgets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface WidgetProps {
  widget: WidgetType;
  onRemove: (widgetId: string) => void;
  children: ReactNode;
}

interface WidgetContentProps {
  children: ReactNode;
}

interface WidgetConfigProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export function Widget({ widget, onRemove, children }: WidgetProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Extract WidgetContent and WidgetConfig from children
  const childArray = Array.isArray(children) ? children : [children];
  const content = childArray.find(
    (child: any) => child?.type === WidgetContent
  );
  const config = childArray.find(
    (child: any) => child?.type === WidgetConfig
  );

  // Handle form submission wrapper
  const handleFormSubmit = (e: React.FormEvent) => {
    if (config && typeof config === 'object' && 'props' in config && config.props.onSubmit) {
      config.props.onSubmit(e);
      setIsConfigOpen(false); // Close dialog after submission
    }
  };

  return (
    <div className="relative h-full w-full bg-card border border-border rounded-xl shadow-sm overflow-visible group">
      {/* Widget Actions */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='relative'>
            <Button
              variant="outline"
              size="icon"
              title="Widget options"
              className='-translate-y-3 translate-x-3 rounded-full h-5 w-5'
            >
              <MoreHorizontal className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {config && (
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Widget Settings</DialogTitle>
                  </DialogHeader>
                  {/* Render config with wrapped submit handler */}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {config && typeof config === 'object' && 'props' in config && config.props.children}
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <DropdownMenuItem 
              onClick={() => onRemove(widget.id)}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Widget Content */}
      <div className="h-full w-full p-4">
        {content}
      </div>
    </div>
  );
}

export function WidgetContent({ children }: WidgetContentProps) {
  return <>{children}</>;
}

export function WidgetConfig({ onSubmit, children }: WidgetConfigProps) {
  // This component just holds the config content
  // The actual form wrapper is handled by the Widget component
  return <>{children}</>;
}
