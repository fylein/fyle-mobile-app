import { ExpenseFilters } from 'src/app/fyle/my-expenses/expenses-filters.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';

export const filters1: Partial<ExpenseFilters> = {
  state: ['DRAFT', 'READY_TO_REPORT'],
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'tx_org_category',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};

export const filters2: Partial<ExpenseFilters> = {
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  sortParam: 'tx_org_category',
  sortDir: 'asc',
  splitExpense: 'YES',
};
