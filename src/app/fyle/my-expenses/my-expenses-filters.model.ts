export type Filters = Partial<{
  state: string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  receiptsAttached: string;
  type: string[];
  sortParam: string;
  sortDir: string;
  cardNumbers: string[];
  splitExpense: string;
}>;

export type ExpenseFilters = Partial<{
  state: string | string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  receiptsAttached: string;
  type: string[];
  sortParam: string;
  sortDir: string;
  cardNumbers: string[];
  splitExpense: string;
  tx_receipt_required: string;
  tx_policy_flag: string;
  tx_policy_amount: string;
  or: string;
}>;
