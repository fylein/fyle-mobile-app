export interface AppState {
  isActive: boolean;
}

export type AppListener = (state: AppState) => void | Promise<void>;

export const App = {
  addListener(_eventName: string, _listener: AppListener): Promise<{ remove: () => void }> {
    // In tests we don't actually hook into any real app lifecycle,
    // so just return a no-op remover.
    return Promise.resolve({ remove: () => {} });
  },
};

