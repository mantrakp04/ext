import { ModeToggle, ThemeProvider } from '@/components/theme-provider';
import { SettingsDialog } from './components/SettingsDialog';
import { TimeDisplay } from './components/TimeDisplay';
import { SearchBar } from './components/SearchBar';
import { QuickLinks } from './components/QuickLinks';

function NewTabApp() {
  return (
    <div className="h-screen w-full bg-background p-2">
      {/* Theme Toggle and Settings */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <ModeToggle />
        <SettingsDialog />
      </div>

      {/* Main Content Container */}
      <div className="h-full rounded-lg">
        <div className="flex flex-col h-full items-center justify-center gap-2 max-w-2xl mx-auto">
          <SearchBar />
          <TimeDisplay />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NewTabApp />
    </ThemeProvider>
  );
}

export default App;
