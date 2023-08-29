import { ExpenseProperties } from '../models/tracking-properties.model';
import {
  expectedUnflattendedTxnData4,
  trackAddExpenseWoCurrency,
  unflattenedTxnWithTrackData,
} from './unflattened-txn.data';

export const createExpenseProperties = {
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
};

export const createExpenseProperties2 = {
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
};

export const editExpenseProperties1 = {
  Type: 'Mileage',
  Amount: unflattenedTxnWithTrackData.tx.amount,
  Currency: unflattenedTxnWithTrackData.tx.currency,
  Category: unflattenedTxnWithTrackData.tx.org_category,
  Time_Spent: '300 secs',
  Used_Autofilled_Project: true,
  Used_Autofilled_CostCenter: true,
  Used_Autofilled_VehicleType: true,
  Used_Autofilled_StartLocation: true,
};
export const createExpenseProperties3: ExpenseProperties = {
  Type: 'Receipt',
  Amount: 344,
  Currency: 'INR',
  Category: 'Software',
  Time_Spent: '180 secs',
  Used_Autofilled_Project: true,
  Used_Autofilled_CostCenter: true,
};

export const editExpenseProperties: ExpenseProperties = {
  ...createExpenseProperties3,
  Type: 'Per Diem',
};
