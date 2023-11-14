export interface ExpenseParams {
  split_group_id?: string;
  employee_id?: string;
  state?: string;
  or?: string | string[];
  report_id?: string;
  order?: string;
  scalar?: boolean;
  id?: string;
  is_receipt_mandatory?: string;
  masked_corporate_card_number?: string;
  and?: string;
}
