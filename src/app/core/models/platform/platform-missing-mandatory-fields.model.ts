export interface PlatformMissingMandatoryFields {
  missing_amount: boolean;
  missing_receipt: boolean;
  missing_currency: boolean;
  missing_expense_field_ids: string[];
}
