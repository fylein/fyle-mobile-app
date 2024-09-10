export interface SelectedFilters<T = void> {
  name: string;
  value: T;
  associatedData?: {
    startDate?: Date;
    endDate?: Date;
  };
}
