import deepFreeze from 'deep-freeze-strict';

import {
  expectedUnflattendedTxnData4,
  expenseTrackCreate,
  trackAddExpenseWoCurrency,
  unflattenedTxnWithTrackData,
} from './unflattened-txn.data';
import { ExpenseProperties } from '../models/expense-properties.model';

export const createExpenseProperties: ExpenseProperties = deepFreeze({
  Type: 'Receipt',
  Amount: expectedUnflattendedTxnData4.tx.amount,
  Currency: expectedUnflattendedTxnData4.tx.currency,
  Category: expectedUnflattendedTxnData4.tx.org_category,
  Time_Spent: '300 secs',
  Used_Autofilled_Category: undefined,
  Used_Autofilled_Project: undefined,
  Used_Autofilled_CostCenter: true,
  Used_Autofilled_Currency: true,
  Instafyle: false,
});

export const createExpenseProperties2: ExpenseProperties = deepFreeze({
  Type: 'Receipt',
  Amount: trackAddExpenseWoCurrency.tx.amount,
  Currency: trackAddExpenseWoCurrency.tx.currency,
  Category: trackAddExpenseWoCurrency.tx.org_category,
  Time_Spent: '300 secs',
  Used_Autofilled_Category: true,
  Used_Autofilled_Project: true,
  Used_Autofilled_CostCenter: true,
  Used_Autofilled_Currency: true,
  Instafyle: false,
});

export const editExpenseProperties1: ExpenseProperties = deepFreeze({
  Type: 'Mileage',
  Amount: unflattenedTxnWithTrackData.tx.amount,
  Currency: unflattenedTxnWithTrackData.tx.currency,
  Category: unflattenedTxnWithTrackData.tx.org_category,
  Time_Spent: '300 secs',
  Used_Autofilled_Project: true,
  Used_Autofilled_CostCenter: true,
  Used_Autofilled_VehicleType: true,
  Used_Autofilled_StartLocation: true,
});

export const createExpenseProperties3: ExpenseProperties = deepFreeze({
  Type: 'Receipt',
  Amount: 344,
  Currency: 'INR',
  Category: 'Software',
  Time_Spent: '180 secs',
  Used_Autofilled_Project: true,
  Used_Autofilled_CostCenter: true,
});

export const createExpenseProperties4: ExpenseProperties = deepFreeze({
  Type: 'Mileage',
  Amount: expenseTrackCreate.tx.amount,
  Currency: expenseTrackCreate.tx.currency,
  Category: expenseTrackCreate.tx.org_category,
  Time_Spent: '30 secs',
  Used_Autofilled_Project: true,
  Used_Autofilled_CostCenter: true,
  Used_Autofilled_VehicleType: true,
  Used_Autofilled_StartLocation: true,
});

export const editExpenseProperties: ExpenseProperties = deepFreeze({
  ...createExpenseProperties3,
  Type: 'Per Diem',
});

export const editExpensePropertiesPlatform: ExpenseProperties = deepFreeze({
  Type: 'Per Diem',
  Amount: 2263.68,
  Currency: 'USD',
  Category: 'Mileage',
  Time_Spent: '180 secs',
  Used_Autofilled_Project: null,
  Used_Autofilled_CostCenter: null,
});
