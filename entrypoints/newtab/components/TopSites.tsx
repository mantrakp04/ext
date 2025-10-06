import { Button } from '@/components/ui/button';
import { getFaviconUrl, settingsAtom } from '../store/settings';
import { useTopSites } from '../hooks/useTopSites';
import { useAtom } from 'jotai';

export function TopSites() {
  const [settings] = useAtom(settingsAtom);
  const { topSites, loading } = useTopSites();

  if (!settings.showTopSites) return null;

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid gap-2 grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Button key={index} variant="outline" size="sm" className="px-1" disabled>
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <div className="w-5 h-5 rounded-sm bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse flex-1" />
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (topSites.length === 0) return null;

  return (
    <div className="w-full">
      <div className="grid gap-2 grid-cols-4">
        {topSites.map((site) => (
          <Button
            key={site.id}
            variant="outline"
            size="sm"
            className='px-1 !bg-card hover:!bg-accent cursor-pointer'
            onClick={() => window.open(site.url, '_blank')}
          >
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <img 
                src={getFaviconUrl(site.url)} 
                alt={site.name} 
                className="w-5 h-5 rounded-sm flex-shrink-0" 
              />
              <span className="truncate text-sm font-medium">{site.name}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
