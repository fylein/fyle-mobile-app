import { PlatformMissingMandatoryFields } from '../models/platform/platform-missing-mandatory-fields.model';

export const missingMandatoryFieldsData1: PlatformMissingMandatoryFields = {
  missing_amount: false,
  missing_currency: false,
  missing_receipt: true,
  missing_expense_field_ids: [],
};

export const missingMandatoryFieldsData2: PlatformMissingMandatoryFields = {
  missing_amount: false,
  missing_currency: false,
  missing_receipt: false,
  missing_expense_field_ids: [],
};
