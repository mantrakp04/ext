import { Sparkles } from 'lucide-react';

function App() {
  const openSidepanel = () => {
    browser.sidePanel.open({ windowId: browser.windows.WINDOW_ID_CURRENT });
    window.close(); // Close the popup after opening sidepanel
  };

  return (
    <div className="w-80 h-48 flex items-center justify-center bg-background">
      <button
        onClick={openSidepanel}
        className="flex flex-col items-center gap-3 p-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-8 h-8" />
        <span className="text-lg font-semibold">Open AI Assistant</span>
        <span className="text-sm opacity-80">Click to open sidepanel</span>
      </button>
    </div>
  );
}

export default App;
