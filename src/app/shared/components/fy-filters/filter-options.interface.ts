import { FilterOptionType } from './filter-option-type.enum';

export interface FilterOptions<T> {
  optionType: FilterOptionType;
  name: string;
  options: { label: string; value: T }[];
  optionsNewFlow?: { label: string; value: T }[];
  optionsNewFlowCCCOnly?: { label: string; value: T }[];
}
