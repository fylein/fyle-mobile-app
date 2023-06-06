export interface SnackbarProperties {
  data: {
    icon: string;
    showCloseButton: boolean;
    message: string;
    redirectiontext?: string;
  };
  duration: number;
}
