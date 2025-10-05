import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom } from '../store/settings';

export function TimeDisplay() {
  const [time, setTime] = useState(new Date());
  const [settings] = useAtom(settingsAtom);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!settings.showTime) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm w-48 aspect-square flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-1">
          {time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </h1>
        {settings.showDate && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {time.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
