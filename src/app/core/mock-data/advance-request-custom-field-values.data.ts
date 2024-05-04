import deepFreeze from 'deep-freeze-strict';

import { AdvanceRequestCustomFieldValues } from '../models/advance-request-custom-field-values.model';

export const advanceRequestCustomFieldValuesData: AdvanceRequestCustomFieldValues[] = deepFreeze([
  {
    name: 'Phase',
    value: 'Phase 1',
    type: 'SELECT',
  },
  {
    name: 'BILLABLE',
    value: true,
    type: 'BOOLEAN',
  },
  {
    name: 'Arrival Date',
    value: '2023-1-2',
    type: 'DATE',
  },
  {
    name: 'Checking',
    value: 'option1',
    type: 'OPTION',
  },
]);

export const advanceRequestCustomFieldValuesData2: AdvanceRequestCustomFieldValues[] = deepFreeze([
  {
    name: 'Phase',
    value: 'Phase 1',
  },
  {
    name: 'BILLABLE',
    value: true,
  },
  {
    name: 'Arrival Date',
    value: '2023-1-2',
  },
  {
    name: 'Checking',
    value: 'option1',
  },
]);
