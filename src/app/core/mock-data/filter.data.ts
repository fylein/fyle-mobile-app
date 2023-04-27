import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';

type Filter = Partial<{
  amount: number;
  createdOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  updatedOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  transactionType: string;
}>;

export const filterData1: Filter = {
  createdOn: {
    name: 'custom',
    customDateStart: new Date('2023-02-20T00:00:00.000Z'),
    customDateEnd: new Date('2023-02-22T00:00:00.000Z'),
  },
  updatedOn: {
    name: 'custom',
    customDateStart: new Date('2023-02-22T00:00:00.000Z'),
    customDateEnd: new Date('2023-02-24T00:00:00.000Z'),
  },
  transactionType: 'Debit',
};

export const filterOptions1 = [
  {
    name: 'Expenses',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Complete',
        value: 'UNREPORTED',
      },
      {
        label: 'Draft',
        value: 'DRAFT',
      },
      {
        label: 'Duplicate',
        value: 'DUPLICATE',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Reports',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Sent Back',
        value: 'SENT_BACK',
      },
      {
        label: 'Unsubmitted',
        value: 'DRAFT',
      },
      {
        label: 'Unapproved',
        value: 'TEAM',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Advances',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Sent Back',
        value: 'SENT_BACK',
      },
    ],
  } as FilterOptions<string>,
];
