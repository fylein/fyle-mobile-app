import { SplitPayload } from './platform/v1/split-payload.model';

export interface SplittingExpenseProperties {
  'Is Evenly Split': boolean;
  Asset: string;
  'Is part of report': boolean;
  'Report ID': string;
  'Expense State': string;
  'User Role': string;
  'Error Message'?: string;
  'Split Payload'?: SplitPayload;
}
