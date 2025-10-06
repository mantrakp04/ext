import { useAtom } from 'jotai';
import { Plus, Trash2, Eye, EyeOff, Settings2 } from 'lucide-react';
import { settingsAtom } from '../store/settings';
import { WidgetType, WidgetSize } from './Widgets';

export function WidgetManager() {
  const [settings, setSettings] = useAtom(settingsAtom);

  // Calculate current grid usage
  const calculateGridUsage = () => {
    const visibleWidgets = (settings.widgets || []).filter(widget => widget.isVisible);
    let totalUnits = 0;
    
    for (const widget of visibleWidgets) {
      const widgetUnits = widget.size === 'square' ? 1 : 2;
      totalUnits += widgetUnits;
    }
    
    return { totalUnits, maxUnits: 12, canAddMore: totalUnits < 12 };
  };

  const { totalUnits, maxUnits, canAddMore } = calculateGridUsage();

  const createWidget = (type: WidgetType, config: Record<string, any> = {}, id?: string) => {
    const widgetId = id || `${type}-${Date.now()}`;
    
    const defaultConfigs: Record<WidgetType, Record<string, any>> = {
      time: {},
      notes: { notes: '' },
      weather: { location: 'Vancouver' },
      stocks: { symbol: 'AAPL' },
    };

    const widgetSizes: Record<WidgetType, WidgetSize> = {
      time: 'square',
      notes: 'rectangle',
      weather: 'square',
      stocks: 'square',
    };

    return {
      id: widgetId,
      type,
      size: widgetSizes[type],
      config: { ...defaultConfigs[type], ...config },
      isVisible: true,
    };
  };

  const addWidget = (type: WidgetType) => {
    if (!canAddMore) {
      return; // Don't add if grid is full
    }
    
    const newWidget = createWidget(type);
    setSettings(prev => ({
      ...prev,
      widgets: [...(prev.widgets || []), newWidget]
    }));
  };

  const removeWidget = (widgetId: string) => {
    setSettings(prev => ({
      ...prev,
      widgets: (prev.widgets || []).filter(widget => widget.id !== widgetId)
    }));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setSettings(prev => ({
      ...prev,
      widgets: (prev.widgets || []).map(widget =>
        widget.id === widgetId
          ? { ...widget, isVisible: !widget.isVisible }
          : widget
      )
    }));
  };

  const getWidgetDisplayName = (widget: { type: WidgetType; config?: Record<string, any> }) => {
    const typeNames: Record<WidgetType, string> = {
      time: 'Time',
      notes: 'Notes',
      weather: 'Weather',
      stocks: 'Stocks',
    };
    
    let name = typeNames[widget.type] || widget.type;
    
    // Add location info for weather widgets
    if (widget.type === 'weather' && widget.config?.location) {
      name += ` (${widget.config.location})`;
    }
    
    return name;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Widget Manager</h3>
      </div>
      
      {/* Grid Usage Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground">Grid Usage:</h4>
          <span className="text-xs text-muted-foreground">
            {totalUnits}/{maxUnits} units used
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(totalUnits / maxUnits) * 100}%` }}
          />
        </div>
        {!canAddMore && (
          <p className="text-xs text-muted-foreground">
            Grid is full (4×3 max). Hide or remove widgets to add more.
          </p>
        )}
      </div>

      {/* Add Widget Buttons */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-medium text-muted-foreground">Add Widgets:</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => addWidget('time')}
            disabled={!canAddMore}
            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
              canAddMore 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Plus className="h-3 w-3" />
            Time
          </button>
          <button
            onClick={() => addWidget('notes')}
            disabled={!canAddMore}
            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
              canAddMore 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Plus className="h-3 w-3" />
            Notes
          </button>
          <button
            onClick={() => addWidget('weather')}
            disabled={!canAddMore}
            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
              canAddMore 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Plus className="h-3 w-3" />
            Weather
          </button>
          <button
            onClick={() => addWidget('stocks')}
            disabled={!canAddMore}
            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
              canAddMore 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Plus className="h-3 w-3" />
            Stocks
          </button>
        </div>
      </div>

      {/* Widget List */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Current Widgets:</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {(settings.widgets || []).map((widget) => (
            <div
              key={widget.id}
              className={`flex items-center justify-between p-2 rounded-md text-xs transition-colors ${
                widget.isVisible 
                  ? 'bg-muted text-foreground' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-medium truncate">{getWidgetDisplayName(widget)}</span>
                <span className="text-muted-foreground text-xs">
                  ({widget.size === 'square' ? '1×1' : '2×1'})
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="p-1 hover:bg-muted-foreground/10 rounded transition-colors"
                  title={widget.isVisible ? 'Hide widget' : 'Show widget'}
                >
                  {widget.isVisible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                  title="Remove widget"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {(settings.widgets || []).length === 0 && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No widgets added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
