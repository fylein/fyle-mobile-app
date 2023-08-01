export interface VirtualSelectOption {
  label: string;
  value: object | string;
  selected?: boolean;
  custom?: boolean;
  isRecentlyUsed?: boolean;
}
