export interface PopupConfig {
  header: string;
  message: string;
  showCancelButton?: boolean;
  primaryCta?: {
    text: string
  };
  secondaryCta?: {
    text: string
  };
}
