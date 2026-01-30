/* eslint-disable custom-rules/one-interface-per-file */
/* eslint-disable custom-rules/prefer-semantic-extension-name */
export interface AppState {
  isActive: boolean;
}

// Minimal shape of AppInfo used by the app.
export interface AppInfo {
  version: string;
}

// Use a loose event shape so this mock is compatible with both
// 'appStateChange' (which has isActive) and 'appUrlOpen' (which has url),
// avoiding type errors in application code during tests.
export type AppListener = (event: { [key: string]: any }) => void | Promise<void>;

export const App = {
  addListener(_eventName: string, _listener: AppListener): Promise<{ remove: () => void }> {
    // In tests we don't actually hook into any real app lifecycle,
    // so just return a no-op remover.
    return Promise.resolve({ remove: () => {} });
  },

  // Simple stub for App.getInfo used by DeviceService.
  getInfo(): Promise<AppInfo> {
    return Promise.resolve({ version: '1.2.3' });
  },

  exitApp(): Promise<void> {
    return Promise.resolve();
  },
};

