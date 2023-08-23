import { PerDiemFormValue } from '../models/per-diem-form-value.model';
import { multiplePaymentModesData } from '../test-data/accounts.service.spec.data';
import { expectedCCdata3 } from './cost-centers.data';
import { projects } from './extended-projects.data';
import { draftReportPerDiemData, expectedAddedApproverERpts } from './report-unflattened.data';

export const perDiemFormValuesData1: Partial<PerDiemFormValue> = {
  paymentMode: multiplePaymentModesData[0],
  sub_category: undefined,
  per_diem_rate: null,
  purpose: 'test_term',
  num_days: null,
  report: null,
  from_dt: null,
  to_dt: null,
  billable: null,
  duplicate_detection_reason: null,
  costCenter: undefined,
  project: projects[0],
  custom_inputs: [],
  project_dependent_fields: [],
  cost_center_dependent_fields: [],
};

export const perDiemFormValuesData2: Partial<PerDiemFormValue> = {
  ...perDiemFormValuesData1,
  project: null,
};

export const perDiemFormValuesData3: Partial<PerDiemFormValue> = {
  ...perDiemFormValuesData1,
  per_diem_rate: {
    active: true,
    created_at: new Date('2020-08-12T16:09:14.551Z'),
    currency: 'USD',
    id: 4213,
    name: 'BulkTest2',
    org_id: 'orrjqbDbeP9p',
    rate: 50,
    updated_at: new Date('2022-09-20T11:48:38.901Z'),
    full_name: 'BulkTest2 (50 USD per day)',
    readableRate: '$50.00 per day',
  },
};

export const perDiemFormValuesData4: Partial<PerDiemFormValue> = {
  ...perDiemFormValuesData1,
  report: expectedAddedApproverERpts[0],
};

export const perDiemFormValuesData5: Partial<PerDiemFormValue> = {
  ...perDiemFormValuesData1,
  report: draftReportPerDiemData[0],
};

export const perDiemFormValuesData6: Partial<PerDiemFormValue> = {
  ...perDiemFormValuesData1,
  costCenter: expectedCCdata3[0].value,
};

export const perDiemFormValuesData7: Partial<PerDiemFormValue> = {
  ...perDiemFormValuesData1,
  to_dt: '2023-08-03',
  from_dt: '2023-08-01',
  num_days: 3,
};
