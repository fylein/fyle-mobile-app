import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { AdvancesStates } from '../models/advances-states.model';
import { SortingValue } from '../models/sorting-value.model';

export const filterOptions: FilterOptions<string>[] = [
  {
    name: 'State',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Draft',
        value: AdvancesStates.draft,
      },

      {
        label: 'Sent Back',
        value: AdvancesStates.sentBack,
      },
    ],
  },
  {
    name: 'Sort By',
    optionType: FilterOptionType.singleselect,
    options: [
      {
        label: 'Created At - New to Old',
        value: SortingValue.creationDateAsc,
      },
      {
        label: 'Created At - Old to New',
        value: SortingValue.creationDateDesc,
      },
      {
        label: 'Approved At - New to Old',
        value: SortingValue.approvalDateAsc,
      },
      {
        label: 'Approved At - Old to New',
        value: SortingValue.approvalDateDesc,
      },
      {
        label: `Project - A to Z`,
        value: SortingValue.projectAsc,
      },
      {
        label: `Project - Z to A`,
        value: SortingValue.projectDesc,
      },
    ],
  },
];
