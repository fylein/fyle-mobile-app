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

export type ReportsFilters = Partial<{
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
}>;
