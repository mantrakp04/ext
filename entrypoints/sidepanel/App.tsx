import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { ConvexProvider } from '@/components/convex-provider';
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
    <ConvexProvider>
      <QueryProvider>
        <ThemeProvider>
          <SidePanelApp />
        </ThemeProvider>
      </QueryProvider>
    </ConvexProvider>
  );
}

export default App;
