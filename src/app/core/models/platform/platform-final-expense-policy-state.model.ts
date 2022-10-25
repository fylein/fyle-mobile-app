export interface FinalExpensePolicyState {
  add_approver_user_ids: string[];
  // Expense Id is absent in check policies call
  expense_id?: string;
  amount: number;
  flag: boolean;
  is_receipt_mandatory: boolean;
  remove_employee_approver1: boolean;
  run_status: string;
  run_summary: string[];
}
