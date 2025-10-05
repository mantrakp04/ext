import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    icons: {
      16: '/icon/favicon.ico',
      32: '/icon/favicon.ico',
      48: '/icon/favicon.ico',
      128: '/icon/favicon.ico',
    },
    permissions: [
      'storage',
      'sidePanel',
      'activeTab',
      'tabs',
    ],
  },
});
