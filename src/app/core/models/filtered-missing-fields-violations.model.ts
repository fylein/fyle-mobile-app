export interface FilteredMissingFieldsViolations {
  isMissingFields: boolean;
  type: string;
  name: string;
  currency: string;
  amount: number;
  isExpanded?: boolean;
}
