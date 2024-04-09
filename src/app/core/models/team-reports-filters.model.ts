export interface TeamReportsFilters {
  state: string | string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  sortParam: string;
  sortDir: string;
}
