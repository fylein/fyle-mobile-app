export type PluginListenerHandle = { remove: () => void };

export const Capacitor = {
  // In tests we default to "web" (non-native) so native-only
  // plugin listeners are not invoked unless explicitly overridden.
  isNativePlatform(): boolean {
    return false;
  },
};

