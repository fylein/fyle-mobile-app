
import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.ionicframework.fyle595781',
  appName: 'Sage Exp Mgmt',
  webDir: 'www',
  loggingBehavior: 'debug',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      style: KeyboardStyle.Light,
      resizeOnFullScreen: true,
    },
    AppShortcuts: {
      shortcuts: [
        {
          id: 'capture_receipt',
          title: 'Capture Receipt',
          iosIcon: 'camera', // SF Symbol
          androidIcon: 'ic_shortcut_camera_sage', // Green circle with white camera
        },
        {
          id: 'add_expense',
          title: 'Add Expense',
          iosIcon: 'plus.app', // SF Symbol
          androidIcon: 'ic_shortcut_add_sage', // Green circle with white plus
        },
      ],
    },
  },
  cordova: {
    //It doesn't matter what value is added to access origin - https://capacitorjs.com/docs/v2/cordova/using-cordova-plugins#:~:text=Capacitor%20does%20not%20support%20Cordova,things%20like%20hooks%20are%20unnecessary
    accessOrigins: ['https://app.fylehq.com'],
  },
  server: {
    androidScheme: 'http',
  },
  android: {
    adjustMarginsForEdgeToEdge: 'force',
  },
};

export default config;
