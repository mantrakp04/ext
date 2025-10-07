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
      <SidePanelApp />
    </ConvexProvider>
  );
}

export default App;
