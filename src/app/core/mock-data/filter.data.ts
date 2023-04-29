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
    name: 'Type',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Complete',
        value: 'COMPLETE',
      },
      {
        label: 'Policy Violated',
        value: 'POLICY_VIOLATED',
      },
      {
        label: 'Incomplete',
        value: 'INCOMPLETE',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Receipts Attached',
    optionType: FilterOptionType.singleselect,
    options: [
      {
        label: 'Yes',
        value: 'true',
      },
      {
        label: 'No',
        value: 'false',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Expense Type',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Mileage',
        value: 'MILEAGE',
      },
      {
        label: 'Per Diem',
        value: 'PER_DIEM',
      },
      {
        label: 'Regular Expenses',
        value: 'REGULAR_EXPENSES',
      },
    ],
  } as FilterOptions<string>,
];
