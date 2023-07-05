export interface SnackbarProperties {
  data: {
    icon: string;
    showCloseButton: boolean;
    message: string;
    redirectionText?: string;
  };
  duration: number;
}
