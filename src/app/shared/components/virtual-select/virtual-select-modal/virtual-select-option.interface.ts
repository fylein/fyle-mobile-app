export interface ModalOption {
  [key: string]: string | number | boolean;
}

export interface Option {
  label: string;
  value: object | string;
  selected?: boolean;
}

export interface VirtualSelectOption extends Option {
  custom?: boolean;
  isRecentlyUsed?: boolean;
}
