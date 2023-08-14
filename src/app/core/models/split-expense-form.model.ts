import { SplitExpense } from './split-expense.model';

export interface SplitExpenseForm {
  value: SplitExpense;
  controls: { amount?: { _pendingChange: () => void }; percentage?: { _pendingChange: () => void } };
  patchValue: (_: { percentage?: number; amount?: number }) => void;
}
