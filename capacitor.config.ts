import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tumafast.kenya',
  appName: 'TumaFast',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
