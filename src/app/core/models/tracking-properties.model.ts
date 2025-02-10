import { DeviceInfo } from '@capacitor/device';
import { Transaction } from './v1/transaction.model';
import { ExpenseView } from './expense-view.enum';
import { TaskFilters } from './task-filters.model';
import { CardNetworkType } from '../enums/card-network-type';
import { SplitPayload } from './platform/v1/split-payload.model';

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
  Type: string;
  'Is Evenly Split': boolean;
  Asset: string;
  'Is part of report': boolean;
  'Report ID': string;
  'Expense State': string;
  'User Role': string;
  'Error Message'?: string;
  'Split Payload'?: SplitPayload;
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
  'User Org ID': string;
}

export interface CorporateCardExpenseProperties {
  Type: string;
  transaction: Transaction;
}

export interface ExpenseClickProperties {
  view: ExpenseView;
  category: string;
}

export interface FooterButtonClickProperties {
  Action: string;
  Url: string;
}

export interface TaskPageOpenProperties {
  Asset: string;
  from: string;
}

export interface TaskProperties {
  Asset: string;
  header: string;
}

export interface TaskFilterClearAllProperties {
  Asset: string;
  appliedFilters: TaskFilters;
}

export interface FilterPillClickedProperties {
  Asset: string;
  filterPillType: string;
}

export interface ViewReportInfoProperties {
  view: ExpenseView;
  action: string;
  segment: string;
}

export interface OnSettingToggleProperties {
  userSetting: string;
  action: string;
  setDefaultCurrency: boolean;
}

export interface AppLaunchTimeProperties {
  'App launch time': string;
  'Is logged in': boolean;
  'Is multi org': boolean;
}

export interface CaptureSingleReceiptTimeProperties {
  'Capture receipt time': string;
  'Is logged in': boolean;
  'Is multi org': boolean;
}

export interface SwitchOrgLaunchTimeProperties {
  'Switch org launch time': string;
  'Login method': string;
}

export interface ReportNameChangeProperties {
  Time_spent: number;
  Roles: string[];
}

export interface CardEnrolledProperties {
  Source: string;
  'Card Network': CardNetworkType;
  'Card ID': string;
}

export interface CardUnenrolledProperties {
  'Card Network': CardNetworkType;
  'Card ID': string;
}

export interface CardEnrollmentErrorsProperties {
  'Card Network': CardNetworkType;
  Source: string;
  'Error Message': string;
}

export interface EnrollingNonRTFCardProperties {
  Source: string;
}
