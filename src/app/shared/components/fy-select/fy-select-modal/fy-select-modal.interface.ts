export interface ModalOption {
  [key: string]: string | number | boolean;
}

export interface Option {
  label: string;
  value: any;
  selected?: boolean;
}

export interface ExtendedOption extends Option {
  custom?: boolean;
}
