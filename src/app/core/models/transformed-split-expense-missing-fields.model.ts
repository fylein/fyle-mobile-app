import { PlatformMissingMandatoryFields } from './platform/platform-missing-mandatory-fields.model';

export interface TransformedSplitExpenseMissingFields {
  amount: number;
  currency: string;
  name: string;
  inputFieldInfo?: { [key: string]: string };
  type: string;
  data: PlatformMissingMandatoryFields;
}
