import { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { Settings, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { settingsAtom, type Settings as SettingsType, searchEngines, defaultSettings, stockBackgroundImages } from '../store/settings';
import { useTheme } from '@/components/theme-provider';
import { WidgetManager } from './WidgetManager';

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateSetting('backgroundImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockImageSelect = (imageUrl: string) => {
    updateSetting('backgroundImage', imageUrl);
    
    // Find the selected image and update theme based on its recommended theme
    const selectedImage = stockBackgroundImages.find(img => img.url === imageUrl);
    if (selectedImage && selectedImage.theme !== 'system') {
      handleThemeChange(selectedImage.theme as 'light' | 'dark');
    }
  };

  const handleRemoveBackground = () => {
    updateSetting('backgroundImage', '');
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

        <div className="flex flex-col gap-6">
          {/* Theme */}
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Search Engine</label>
            <div className="flex flex-wrap gap-2">
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Display Options</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show quick links</span>
                <Switch
                  checked={settings.showQuickLinks}
                  onCheckedChange={(checked: boolean) => updateSetting('showQuickLinks', checked)}
                />
              </div>
            </div>
          </div>

          {/* Widget Management */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Widgets</label>
            <WidgetManager />
          </div>

          {/* Background Image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Background Image</label>
            
            {/* Current Background Preview */}
            {settings.backgroundImage && (
              <div className="relative">
                <div className="w-full h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={settings.backgroundImage} 
                    alt="Background preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveBackground}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Custom Image */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Upload Custom Image</label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </div>

            {/* Stock Images */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Stock Images</label>
              <div className="grid grid-cols-2 gap-2">
                {stockBackgroundImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative cursor-pointer group"
                    onClick={() => handleStockImageSelect(image.url)}
                  >
                    <div className="w-full h-20 rounded-lg overflow-hidden border">
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{image.name}</span>
                    </div>
                    {settings.backgroundImage === image.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
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
