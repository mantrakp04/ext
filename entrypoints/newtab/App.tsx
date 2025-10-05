import { ModeToggle, ThemeProvider } from '@/components/theme-provider';
import { SettingsDialog } from './components/SettingsDialog';
import { Widgets, Widget } from './components/Widgets';
import { TimeWidget } from './components/TimeWidget';
import { NotesWidget } from './components/NotesWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { SearchBar } from './components/SearchBar';
import { QuickLinks } from './components/QuickLinks';
import { useAtom } from 'jotai';
import { settingsAtom } from './store/settings';

function NewTabApp() {
  const [settings] = useAtom(settingsAtom);
  
  const allWidgets: Widget[] = [
    {
      id: 'time',
      type: 'square',
      component: <TimeWidget />
    },
    {
      id: 'notes',
      type: 'rectangle',
      component: <NotesWidget />
    },
    {
      id: 'weather',
      type: 'square',
      component: <WeatherWidget />
    }
  ];

  // Filter out disabled widgets
  const widgets = allWidgets.filter(widget => {
    switch (widget.id) {
      case 'time':
        return settings.showDateTime;
      case 'notes':
        return settings.showNotes;
      case 'weather':
        return settings.showWeather;
      default:
        return true;
    }
  });

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
          <Widgets widgets={widgets} />
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
