import { FilterOptionType } from './filter-option-type.enum';

export interface FilterOptions<T> {
  optionType: FilterOptionType;
  name: string;
  options: { label: string; value: T }[];
}
