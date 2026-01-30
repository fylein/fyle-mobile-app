// The interfaces are still maintained in the same file to make the tests pass
export interface PermissionStatus {
  receive: string;
}

export interface Token {
  value?: string;
}

// Keep a very loose event shape to avoid type coupling in tests.
export interface PushNotificationEvent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addListener(_eventName: string, _listener: any): Promise<{ remove: () => void }> {
    return Promise.resolve({ remove: () => {} });
  },
};

