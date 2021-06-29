export interface SelectedFilters<T> {
  name: string;
  value: T | T[];
  associatedData?: {
    from?: Date,
    to?: Date
  };
}
