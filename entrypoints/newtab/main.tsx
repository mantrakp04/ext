import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../style.css';

const checkAutoFocus = () => {
  // Get settings from localStorage
  const settings = localStorage.getItem('settings');
  if (settings) {
    try {
      const parsedSettings = JSON.parse(settings);
      if (parsedSettings.autoFocusSearchBar === false) {
        return;
      }
    } catch (error) {
      console.error('Error parsing settings:', error);
    }
  }
  
  // Apply the workaround if enabled (default behavior)
  if (location.search !== '?focused') {
    location.search = '?focused';
    throw new Error('Reloading to shift focus');
  }
};

checkAutoFocus();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
