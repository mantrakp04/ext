import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/QueryProvider';
import { ChatInterface } from './components/ChatInterface';

function SidePanelApp() {
  return (
    <div className="h-screen w-full bg-background">
      <ChatInterface />
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SidePanelApp />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;

