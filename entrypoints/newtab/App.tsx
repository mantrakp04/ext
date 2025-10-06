import { ModeToggle, ThemeProvider, BackgroundWrapper } from '@/components/theme-provider';
import { SettingsDialog } from './components/SettingsDialog';
import { Widgets } from './components/Widgets';
import { SearchBar } from './components/SearchBar';
import { TopSites } from './components/TopSites';
import { QuickLinks } from './components/QuickLinks';
import { QueryProvider } from '../../components/QueryProvider';
import { useAtom } from 'jotai';
import { settingsAtom } from './store/settings';

function NewTabApp() {
  const [settings] = useAtom(settingsAtom);

  return (
    <BackgroundWrapper>
      {/* Theme Toggle and Settings */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <ModeToggle />
        <SettingsDialog />
      </div>

      {/* Main Content Container */}
      <div 
        className="h-full rounded-lg bg-background/80"
        style={{
          backdropFilter: settings.backgroundBlur > 0 ? `blur(${settings.backgroundBlur}px)` : 'none',
        }}
      >
        <div className="flex flex-col h-full items-center justify-center gap-2 max-w-2xl mx-auto">
          <SearchBar />
          <Widgets />
          <TopSites />
          <QuickLinks />
        </div>
      </div>
    </BackgroundWrapper>
  );
}

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <NewTabApp />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
