export interface CustomField {
  id?: number;
  name: string;
  value: string | string[] | Date | boolean | number;
  type?: string;
  displayValue?: string;
  mandatory?: boolean;
}
