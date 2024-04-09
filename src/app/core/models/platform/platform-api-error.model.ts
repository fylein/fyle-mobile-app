export interface PlatformApiError<T = null> {
  // data may contain more information about the error, but it can be different for different APIs so using a generic type, it is set to null by default
  data: T;
  error: string;
  message: string;
}
