export interface SelectedFilters<T> {
  name: string;
  value: T;
  associatedData?: {
    startDate?: Date;
    endDate?: Date;
  };
}
