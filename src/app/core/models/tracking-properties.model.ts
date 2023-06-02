import { DeviceInfo } from '@capacitor/device';
import { Transaction } from './v1/transaction.model';
import { ExpenseView } from './expense-view.enum';

export interface TrackingMethods {
  identify<T, K>(data: T, property?: K): void;
  track(action: string, properties: Partial<EventTrackProperties>): void;
}

export interface IdentifyProperties {
  [key: string]: string;
}

export interface EventTrackProperties {
  Asset: string;
  DeviceType: string;
  deviceInfo: Partial<DeviceInfo>;
  appVersion: string;
  label: string;
  lastLoggedInVersion: string;
  user_email: string;
}

export interface ExpenseProperties {
  Type: string;
  Amount: number;
  Currency: string;
  Category: string;
  Time_Spent: string;
  Used_Autofilled_Category?: boolean;
  Used_Autofilled_Project: boolean;
  Used_Autofilled_CostCenter: boolean;
  Used_Autofilled_Currency?: boolean;
  Instafyle?: boolean;
  Used_Autofilled_VehicleType?: boolean;
  Used_Autofilled_StartLocation?: boolean;
}

export interface SplittingExpenseProperties {
  'Split Type': string;
  'Is Evenly Split': boolean;
}

export interface PolicyCorrectionProperties {
  Violation: string;
  Mode: string;
}

export interface AddAttachmentProperties {
  type: string;
  Mode: string;
  Category: string;
}

export interface CommentHistoryActionProperties {
  action: string;
  segment: string;
}

export interface CreateReportProperties {
  Expense_Count: number;
  Report_Value: number;
}

export interface SwitchOrgProperties {
  Asset: string;
  'Switch To': string;
  'Is Destination Org Active': boolean;
  'Is Destination Org Primary': boolean;
  'Is Current Org Primary': boolean;
  Source: string;
  'User Email': string;
  'User Org Name': string;
  'User Org ID': string;
  'User Full Name': string;
}

export interface CorporateCardExpenseProperties {
  Type: string;
  transaction: Transaction;
}

export interface ExpenseClickProperties {
  view: ExpenseView;
  category: string;
}
