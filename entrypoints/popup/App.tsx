import { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('Popup opened, opening sidepanel');
    
    browser.windows.getCurrent().then((currentWindow) => {
      if (currentWindow.id) {
        console.log('Opening sidepanel for window:', currentWindow.id);
        browser.sidePanel
          .open({ windowId: currentWindow.id })
          .then(() => {
            window.close();
          })
          .catch((error) => {
            console.error('Error opening sidepanel:', error);
          });
      }
    });
  }, []);

  return null;
}

export default App;
