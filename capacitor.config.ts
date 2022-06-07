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
    CodePush: {
      ANDROID_DEPLOY_KEY: 'CODEPUSH_ANDROID_DEPLOY_KEY',
      SERVER_URL: 'https://codepush.appcenter.ms/',
    },
  },
  cordova: {
    accessOrigins: ['https://app.fylehq.com'],
  },
};

export default config;
