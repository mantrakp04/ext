import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider } from '@/components/convex-provider';
import '../style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider>
      <div>
        <h1>Auth</h1>
        <p>Feel free to close this tab and refresh the sidepanel</p>
      </div>
    </ConvexProvider>
  </React.StrictMode>
);
