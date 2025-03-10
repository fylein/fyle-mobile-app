export interface FilteredMissingFieldsViolations {
  isMissingFields: boolean;
  type: string;
  name: string;
  currency: string;
  inputFieldInfo?: { [key: string]: string };
  amount: number;
  isExpanded?: boolean;
}
