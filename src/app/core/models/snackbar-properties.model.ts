export interface SnackbarProperties {
  data: {
    icon: string;
    showCloseButton: boolean;
    messageType: 'success' | 'failure' | 'information';
    message: string;
    redirectionText?: string;
  };
  duration: number;
}
