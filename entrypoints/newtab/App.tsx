import { ModeToggle, ThemeProvider, BackgroundWrapper } from '@/components/theme-provider';
import { SettingsDialog } from './components/SettingsDialog';
import { Widgets } from './components/Widgets';
import { SearchBar } from './components/SearchBar';
import { QuickLinks } from './components/QuickLinks';
import { QueryProvider } from '../../components/QueryProvider';

function NewTabApp() {

  return (
    <BackgroundWrapper>
      {/* Theme Toggle and Settings */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <ModeToggle />
        <SettingsDialog />
      </div>

      {/* Main Content Container */}
      <div className="h-full rounded-lg bg-background/90">
        <div className="flex flex-col h-full items-center justify-center gap-2 max-w-2xl mx-auto">
          <SearchBar />
          <Widgets />
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
