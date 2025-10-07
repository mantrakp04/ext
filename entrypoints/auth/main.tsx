import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider } from '@/components/convex-provider';
import '../style.css';

function TriggerSidePanelRefresh() {
  useEffect(() => {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  }, []);

  return (<></>);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider>
      <div>
        <h1>Auth</h1>
        <p>Feel free to close this tab</p>
        <TriggerSidePanelRefresh />
      </div>
    </ConvexProvider>
  </React.StrictMode>
);
