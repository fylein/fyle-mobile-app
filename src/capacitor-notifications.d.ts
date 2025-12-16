declare module '@capacitor/push-notifications' {
  export interface Token {
    value: string;
  }

  export interface PushNotificationSchema {
    title?: string;
    body?: string;
    data?: unknown;
  }

  export interface ActionPerformed {
    notification: PushNotificationSchema;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
  }

  export const PushNotifications: {
    requestPermissions(): Promise<{ receive: 'granted' | 'denied' | 'prompt' }>;
    register(): Promise<void>;
    addListener(
      eventName: 'registration',
      listenerFunc: (token: Token) => void,
    ): Promise<{ remove: () => void }>;
    addListener(
      eventName: 'registrationError',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listenerFunc: (error: any) => void,
    ): Promise<{ remove: () => void }>;
    addListener(
      eventName: 'pushNotificationReceived',
      listenerFunc: (notification: PushNotificationSchema) => void,
    ): Promise<{ remove: () => void }>;
    addListener(
      eventName: 'pushNotificationActionPerformed',
      listenerFunc: (notification: ActionPerformed) => void,
    ): Promise<{ remove: () => void }>;
  };
}

declare module '@capacitor/local-notifications' {
  export interface LocalNotificationSchema {
    id: number;
    title?: string;
    body?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extra?: any;
  }

  export const LocalNotifications: {
    requestPermissions(): Promise<{ display?: 'granted' | 'denied' | 'prompt' }>;
    schedule(options: { notifications: LocalNotificationSchema[] }): Promise<void>;
  };
}

declare module '@capacitor/core' {
  export const Capacitor: {
    isNativePlatform(): boolean;
  };
}



