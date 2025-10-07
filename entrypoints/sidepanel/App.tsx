import { ChatInterface } from './components/ChatInterface';
import { SignOutButton } from '@/components/convex-provider';

function App() {
  return (
    <div className="h-screen w-full bg-background">
      <ChatInterface />
      <SignOutButton />
    </div>
  )
}

export default App;
