import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tumafast.kenya',
  appName: 'TumaFast',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '672048373138-ja58begjt0ieksollh1lmqacos65luus.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "light",
      backgroundColor: "#FFFFFF"
    },
  },
};

export default config;
