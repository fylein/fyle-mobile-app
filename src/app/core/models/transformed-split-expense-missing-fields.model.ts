import { PlatformMissingMandatoryFields } from './platform/platform-missing-mandatory-fields.model';

export interface TransformedSplitExpenseMissingFields {
  amount: number;
  currency: string;
  name: string;
  type: string;
  data: PlatformMissingMandatoryFields;
}
