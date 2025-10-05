import { useState, useEffect } from 'react';

export function TimeWidget({ timezone }: { timezone?: string }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-light mb-1">
          {time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: timezone,
          })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {time.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: timezone,
          })}
        </p>
      </div>
    </div>
  );
}
