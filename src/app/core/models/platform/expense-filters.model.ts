import { Filters } from 'src/app/fyle/my-expenses/my-expenses-filters.model';

export interface ExpenseFilters extends Omit<Filters, 'state'> {
  state: string | string[];
  cardNumbers: string[];
  is_split: string;
  is_receipt_mandatory: string;
  is_policy_flagged: string;
  policy_amount: string;
  or: string;
}
