export interface ExpenseDuplicateSetsResponse {
  data: ExpenseDuplicateSet[];
}

export interface ExpenseDuplicateSet {
  expense_ids: string[];
}
