export interface SelectedFilters<T> {
  name: string;
  value: T | T[];
  associatedData?: {
    startDate?: Date;
    endDate?: Date;
  };
}
