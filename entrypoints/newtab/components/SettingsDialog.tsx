import { useState } from 'react';
import { useAtom } from 'jotai';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { settingsAtom, type Settings as SettingsType, searchEngines, defaultSettings } from '../store/settings';
import { useTheme } from '@/components/theme-provider';

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setTheme(defaultSettings.theme);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updateSetting('theme', newTheme);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="hover:bg-accent/50">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your new tab experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Enter your name"
              value={settings.userName}
              onChange={(e) => updateSetting('userName', e.target.value)}
            />
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <Button
                  key={themeOption}
                  variant={settings.theme === themeOption ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange(themeOption)}
                  className="capitalize"
                >
                  {themeOption}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Engine */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Engine</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(searchEngines).map(([key, engine]) => (
                <Button
                  key={key}
                  variant={settings.searchEngine === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('searchEngine', key as any)}
                >
                  {engine.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Options</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show greeting</span>
                <Button
                  variant={settings.showGreeting ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('showGreeting', !settings.showGreeting)}
                >
                  {settings.showGreeting ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show date</span>
                <Button
                  variant={settings.showDate ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('showDate', !settings.showDate)}
                >
                  {settings.showDate ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show time</span>
                <Button
                  variant={settings.showTime ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('showTime', !settings.showTime)}
                >
                  {settings.showTime ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show quick links</span>
                <Button
                  variant={settings.showQuickLinks ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('showQuickLinks', !settings.showQuickLinks)}
                >
                  {settings.showQuickLinks ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={resetSettings}>
            Reset Settings
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
