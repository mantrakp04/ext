import { ModeToggle, BackgroundWrapper } from '@/components/theme-provider';
import { SettingsDialog } from './components/SettingsDialog';
import { Widgets } from './components/Widgets';
import { SearchBar } from './components/SearchBar';
import { TopSites } from './components/TopSites';
import { QuickLinks } from './components/QuickLinks';
import { useAtom } from 'jotai';
import { settingsAtom } from './store/settings';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

function NewTabApp() {
  const [settings] = useAtom(settingsAtom);

  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <BackgroundWrapper>
      {/* Theme Toggle and Settings */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
        <ModeToggle />
        <SettingsDialog />
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Avatar className="border-2 border-border cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage 
                    src={session.user.image || undefined} 
                    alt={session.user.name || 'User'}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name || 'User'}
                  </p>
                  {session.user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await authClient.signOut();
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={async () => {
            await authClient.signIn.social({
              provider: "google",
              callbackURL: chrome.runtime.getURL('newtab.html'),
            });
          }} variant={"outline"}>
            Sign in
          </Button>
        )}
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
  return <NewTabApp />;
}

export default App;
