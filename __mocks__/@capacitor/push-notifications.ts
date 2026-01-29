export interface PermissionStatus {
  receive: string;
}

export interface Token {
  value?: string;
  // Allow additional properties so the type is flexible in tests.
  [key: string]: any;
}

export interface PushNotificationEvent {
  notification?: {
    data?: any;
  };
}

export type PushNotificationListener = (event: PushNotificationEvent) => void;

export const PushNotifications = {
  requestPermissions(): Promise<PermissionStatus> {
    return Promise.resolve({ receive: 'denied' });
  },

  checkPermissions(): Promise<PermissionStatus> {
    return Promise.resolve({ receive: 'denied' });
  },

  register(): Promise<void> {
    return Promise.resolve();
  },

  unregister(): Promise<void> {
    return Promise.resolve();
  },

  addListener(
    _eventName: string,
    _listener: PushNotificationListener,
  ): Promise<{ remove: () => void }> {
    return Promise.resolve({ remove: () => {} });
  },
};

