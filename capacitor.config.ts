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
    //It doesn't matter what value is added to access origin - https://capacitorjs.com/docs/v2/cordova/using-cordova-plugins#:~:text=Capacitor%20does%20not%20support%20Cordova,things%20like%20hooks%20are%20unnecessary
    accessOrigins: ['https://app.fylehq.com'],
  },
};

export default config;
