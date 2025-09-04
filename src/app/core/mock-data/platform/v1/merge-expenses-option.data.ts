import { MergeExpensesOption } from 'src/app/core/models/merge-expenses-option.model';
import { apiExpenses3 } from './expense.data';
import deepFreeze from 'deep-freeze-strict';
import { MergeExpensesOptionsData } from 'src/app/core/models/merge-expenses-options-data.model';
import { Destination } from 'src/app/core/models/destination.model';

export const receiptOptionsData: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'Receipt From Expense  1 ',
    value: apiExpenses3[0].id,
  },
  {
    label: 'Receipt From Expense  2 ',
    value: apiExpenses3[1].id,
  },
]);

export const billableOptionsData: MergeExpensesOptionsData<boolean> = deepFreeze({
  options: [
    {
      label: 'No',
      value: false,
    },
  ],
  areSameValues: false,
});

export const expenseToKeepOptionsData: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'Mar 13 ₹100.00 Merchant Test - Staging Project',
    value: apiExpenses3[0].id,
  },
  {
    label: 'Mar 08 ₹100.00 Merchant Test - Staging Project',
    value: apiExpenses3[1].id,
  },
]);

export const expenseToKeepOptionsDataWithoutDate: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: '  Merchant Test - Staging Project',
    value: apiExpenses3[0].id,
  },
  {
    label: '  Merchant Test - Staging Project',
    value: apiExpenses3[1].id,
  },
]);

export const amountOptionsData: MergeExpensesOptionsData<string> = deepFreeze({
  options: [
    {
      label: 'INR 100',
      value: apiExpenses3[0].id,
    },
    {
      label: 'INR 200',
      value: apiExpenses3[1].id,
    },
  ],
  areSameValues: false,
});

export const amountOptionsDataWithForeignCurrency: MergeExpensesOptionsData<string> = deepFreeze({
  options: [
    {
      label: 'USD 800  (INR 100)',
      value: apiExpenses3[0].id,
    },
    {
      label: 'USD 1600  (INR 200)',
      value: apiExpenses3[1].id,
    },
  ],
  areSameValues: false,
});

export const amountOptionsDataWithZeroAmount: MergeExpensesOptionsData<string> = deepFreeze({
  options: [
    {
      label: '0',
      value: apiExpenses3[0].id,
    },
    {
      label: '0',
      value: apiExpenses3[1].id,
    },
  ],
  areSameValues: true,
});

export const dateOfSpendOptionsData: MergeExpensesOptionsData<Date> = deepFreeze({
  options: [
    {
      label: 'Mar 13, 2023',
      value: new Date('2023-03-13T11:30:00.000Z'),
    },
    {
      label: 'Mar 08, 2023',
      value: new Date('2023-03-08T11:30:00.000Z'),
    },
  ],
  areSameValues: false,
});

export const paymentModeOptionsData: MergeExpensesOptionsData<string> = deepFreeze({
  options: [
    {
      label: 'Corporate Card',
      value: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
    },
    {
      label: 'Corporate Card',
      value: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
    },
  ],
  areSameValues: true,
});

export const merchantOptionsData: MergeExpensesOptionsData<string> = deepFreeze({
  options: [
    {
      label: 'Merchant Test',
      value: 'Merchant Test',
    },
    {
      label: 'Merchant Test',
      value: 'Merchant Test',
    },
  ],
  areSameValues: true,
});

export const projectOptionsData: MergeExpensesOptionsData<number> = deepFreeze({
  options: [
    {
      label: 'Staging Project',
      value: apiExpenses3[0].project_id,
    },
    {
      label: 'Staging Project',
      value: apiExpenses3[1].project_id,
    },
  ],
  areSameValues: true,
});

export const categoryOptionsData1: MergeExpensesOptionsData<number> = deepFreeze({
  options: [
    {
      label: 'Food',
      value: 201952,
    },
    {
      label: 'Hotel',
      value: 16582,
    },
  ],
  areSameValues: false,
});

export const formattedCategoryOptionsData: MergeExpensesOption<number>[] = deepFreeze([
  {
    label: 'Food',
    value: 201952,
  },
  {
    label: 'Hotel',
    value: 16582,
  },
]);

export const locationOptionsData: MergeExpensesOptionsData<Destination> = deepFreeze({
  options: [
    {
      label: 'Kalyan Station Rd, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra 421301, India',
      value: {
        city: 'Kalyan',
        country: 'India',
        display: 'Kalyan Station Road, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra, India',
        formatted_address: 'Kalyan Station Rd, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra 421301, India',
        latitude: 19.238037,
        longitude: 73.1296469,
        state: 'Maharashtra',
      },
    },
  ],
  areSameValues: false,
});
