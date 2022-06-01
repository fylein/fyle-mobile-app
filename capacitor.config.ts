import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ionicframework.fyle595781',
  appName: 'Fyle',
  webDir: 'www',
  bundledWebRuntime: false,
  loggingBehavior: 'debug',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      style: 'light',
    },
  },
  cordova: {
    accessOrigins: ['https://app.fylehq.com'],
  },
};

export default config;
