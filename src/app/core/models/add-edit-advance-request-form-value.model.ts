import { AdvanceRequestCustomFieldValues } from './advance-request-custom-field-values.model';
import { CurrencyObj } from './currency-obj.model';
import { ProjectV2 } from './v2/extended-project.model';

export interface AddEditAdvanceRequestFormValue {
  currencyObj: CurrencyObj;
  purpose: string;
  notes: string;
  project: ProjectV2;
  customFieldValues: AdvanceRequestCustomFieldValues[];
}
