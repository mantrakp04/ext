import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Widget, WidgetContent, WidgetConfig } from './WidgetCard';
import { Widget as WidgetType } from './Widgets';

// Common timezone presets
const TIMEZONE_PRESETS = [
  { label: 'UTC', value: 'UTC' },
  { label: 'PST (Pacific)', value: 'America/Los_Angeles' },
  { label: 'EST (Eastern)', value: 'America/New_York' },
  { label: 'CST (Central)', value: 'America/Chicago' },
  { label: 'MST (Mountain)', value: 'America/Denver' },
  { label: 'IST (India)', value: 'Asia/Kolkata' },
  { label: 'JST (Japan)', value: 'Asia/Tokyo' },
  { label: 'CET (Central Europe)', value: 'Europe/Berlin' },
  { label: 'GMT (London)', value: 'Europe/London' },
  { label: 'AEST (Australia East)', value: 'Australia/Sydney' },
];

export function TimeWidget({ props }: { props: {
  widget: WidgetType,
  onRemove: (widgetId: string) => void,
  onConfigChange: (widgetId: string, config: Record<string, any>) => void
}}) {
  const { widget, onRemove, onConfigChange } = props;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Validate timezone and provide fallback
  const isValidTimezone = (tz: string | undefined) => {
    if (!tz) return false;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  };

  const displayTimezone = widget.config.timezone || '';
  const validTimezone = isValidTimezone(displayTimezone) ? displayTimezone : undefined;

  // Get timezone abbreviation
  const getTimezoneAbbreviation = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(new Date());
      const timeZoneName = parts.find(part => part.type === 'timeZoneName');
      return timeZoneName?.value || tz.split('/').pop()?.replace('_', ' ') || tz;
    } catch {
      return tz.split('/').pop()?.replace('_', ' ') || tz;
    }
  };

  return (
    <Widget widget={widget} onRemove={onRemove}>
      <WidgetContent>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-light mb-1">
              {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: !(widget.config.use24Hour ?? true),
                timeZone: validTimezone,
              })}
            </h1>
            <p className="text-xs text-muted-foreground">
              {time.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: validTimezone,
              })}
            </p>
            {validTimezone && (
              <p className="text-xs text-muted-foreground mt-1">
                {getTimezoneAbbreviation(validTimezone)}
              </p>
            )}
            {displayTimezone && !validTimezone && (
              <p className="text-xs text-destructive mt-1">
                Invalid timezone: {displayTimezone}
              </p>
            )}
          </div>
        </div>
      </WidgetContent>
      
      <WidgetConfig onSubmit={(e) => {
          // No need to save anything since changes are applied immediately
      }}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <select
              value={widget.config.timezone || ''}
              onChange={(e) => onConfigChange(widget.id, { ...widget.config, timezone: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Local Time</option>
              {TIMEZONE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Select a timezone or leave empty for local time
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Clock Format</label>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant={(widget.config.use24Hour ?? true) ? "default" : "outline"}
                size="sm"
                onClick={() => onConfigChange(widget.id, { ...widget.config, use24Hour: true })}
                className="flex-1"
              >
                24-hour
              </Button>
              <Button
                type="button"
                variant={!(widget.config.use24Hour ?? true) ? "default" : "outline"}
                size="sm"
                onClick={() => onConfigChange(widget.id, { ...widget.config, use24Hour: false })}
                className="flex-1"
              >
                12-hour
              </Button>
            </div>
          </div>
        </div>
      </WidgetConfig>
    </Widget>
  );
}
