export interface TxnCustomProperties {
  id?: number;
  mandatory?: boolean;
  name: string;
  options?: { label: string; value: string }[] | string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  value: any;
}
