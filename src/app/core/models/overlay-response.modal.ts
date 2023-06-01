export interface OverlayResponse<T> {
  data: {
    action?: T;
    role?: string;
  };
}
