export interface FreshChatWidget {
  init: (options: {
    config: {
      disableNotifications: boolean;
    };
    token: string;
    host: string;
    externalId: string;
    restoreId: string;
  }) => void;
  open: () => void;
  destroy: () => void;
  on: (event: string, callback: Function) => void;
  user: {
    get: (callback: Function) => void;
    setProperties: (properties: {
      firstName: string;
      email: string;
      orgName: string;
      orgId: string;
      userId: string;
      device: string;
    }) => void;
  };
}
