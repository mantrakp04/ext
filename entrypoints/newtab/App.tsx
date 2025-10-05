import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const defaultLinks: QuickLink[] = [
  { id: '1', name: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
  { id: '2', name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { id: '3', name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
  { id: '4', name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
];

function NewTabApp() {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [links, setLinks] = useState<QuickLink[]>(defaultLinks);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', icon: '🔗' });

  useEffect(() => {
    // Load saved preferences
    const savedName = localStorage.getItem('userName');
    const savedLinks = localStorage.getItem('quickLinks');

    if (savedName) setUserName(savedName);
    if (savedLinks) setLinks(JSON.parse(savedLinks));

    // Update time every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = searchQuery.startsWith('http')
        ? searchQuery
        : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      window.location.href = searchUrl;
    }
  };

  const saveName = () => {
    setUserName(tempName);
    localStorage.setItem('userName', tempName);
    setIsEditingName(false);
  };

  const addLink = () => {
    if (newLink.name && newLink.url) {
      const link: QuickLink = {
        id: Date.now().toString(),
        ...newLink,
      };
      const updatedLinks = [...links, link];
      setLinks(updatedLinks);
      localStorage.setItem('quickLinks', JSON.stringify(updatedLinks));
      setNewLink({ name: '', url: '', icon: '🔗' });
      setIsAddingLink(false);
    }
  };

  const removeLink = (id: string) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
    localStorage.setItem('quickLinks', JSON.stringify(updatedLinks));
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-full px-8">
        {/* Time Display */}
        <div className="text-center mb-8 animate-in fade-in duration-500">
          <h1 className="text-8xl font-light mb-2 tracking-tight">
            {time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </h1>
          <p className="text-xl text-muted-foreground">
            {time.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Greeting */}
        <div className="mb-12 text-center animate-in fade-in duration-700 delay-100">
          {!isEditingName ? (
            <h2 className="text-3xl font-light text-muted-foreground group flex items-center gap-2">
              {getGreeting()}
              {userName && `, ${userName}`}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setTempName(userName);
                  setIsEditingName(true);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </h2>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={saveName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingName(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-12 animate-in fade-in duration-700 delay-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search the web or enter a URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:bg-card transition-colors"
            />
          </div>
        </form>

        {/* Quick Links */}
        <div className="animate-in fade-in duration-700 delay-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {links.map((link) => (
              <Card
                key={link.id}
                className="group relative hover:bg-accent/50 transition-all cursor-pointer bg-card/30 backdrop-blur-sm border-border/50 hover:scale-105"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeLink(link.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <a
                  href={link.url}
                  className="flex flex-col items-center justify-center p-6 gap-2"
                >
                  <span className="text-3xl">{link.icon}</span>
                  <span className="text-sm font-medium">{link.name}</span>
                </a>
              </Card>
            ))}

            {/* Add Link Card */}
            {!isAddingLink ? (
              <Card
                className="hover:bg-accent/50 transition-all cursor-pointer bg-card/30 backdrop-blur-sm border-border/50 border-dashed hover:scale-105"
                onClick={() => setIsAddingLink(true)}
              >
                <div className="flex flex-col items-center justify-center p-6 gap-2">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Add Link
                  </span>
                </div>
              </Card>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-border p-4">
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Icon (emoji)"
                    value={newLink.icon}
                    onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Name"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={addLink} className="flex-1 h-7 text-xs">
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingLink(false);
                        setNewLink({ name: '', url: '', icon: '🔗' });
                      }}
                      className="flex-1 h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="newtab-theme">
      <NewTabApp />
    </ThemeProvider>
  );
}

export default App;

