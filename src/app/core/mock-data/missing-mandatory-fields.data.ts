import deepFreeze from 'deep-freeze-strict';

import { PlatformMissingMandatoryFields } from '../models/platform/platform-missing-mandatory-fields.model';

export const missingMandatoryFieldsData1: PlatformMissingMandatoryFields = deepFreeze({
  missing_amount: false,
  missing_currency: false,
  missing_receipt: true,
  missing_expense_field_ids: [],
});

export const missingMandatoryFieldsData2: PlatformMissingMandatoryFields = deepFreeze({
  missing_amount: false,
  missing_currency: false,
  missing_receipt: false,
  missing_expense_field_ids: [],
});
