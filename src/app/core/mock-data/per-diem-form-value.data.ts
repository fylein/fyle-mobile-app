import deepFreeze from 'deep-freeze-strict';

import { PerDiemFormValue } from '../models/per-diem-form-value.model';
import { multiplePaymentModesData } from '../test-data/accounts.service.spec.data';
import { costCentersData2, expectedCCdata3 } from './cost-centers.data';
import { currencyObjData6 } from './currency-obj.data';
import { projects } from './extended-projects.data';
import { orgCategoryData1 } from './org-category.data';
import { perDiemRatesData1 } from './per-diem-rates.data';
import { expectedReportsPaginated } from './platform-report.data';

export const perDiemFormValuesData1: Partial<PerDiemFormValue> = deepFreeze({
  paymentMode: multiplePaymentModesData[0],
  sub_category: undefined,
  per_diem_rate: null,
  purpose: 'test_term',
  num_days: null,
  report: null,
  from_dt: null,
  to_dt: null,
  billable: null,
  costCenter: undefined,
  project: projects[0],
  custom_inputs: [],
  project_dependent_fields: [],
  cost_center_dependent_fields: [],
});

export const perDiemFormValuesData2: Partial<PerDiemFormValue> = deepFreeze({
  ...perDiemFormValuesData1,
  project: null,
});

export const perDiemFormValuesData3: Partial<PerDiemFormValue> = deepFreeze({
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
});

export const perDiemFormValuesData4: Partial<PerDiemFormValue> = deepFreeze({
  ...perDiemFormValuesData1,
  report: expectedReportsPaginated[0],
});

export const perDiemFormValuesData5: Partial<PerDiemFormValue> = deepFreeze({
  ...perDiemFormValuesData1,
  report: expectedReportsPaginated[0],
});

export const perDiemFormValuesData6: Partial<PerDiemFormValue> = deepFreeze({
  ...perDiemFormValuesData1,
  costCenter: expectedCCdata3[0].value,
});

export const perDiemFormValuesData7: Partial<PerDiemFormValue> = deepFreeze({
  ...perDiemFormValuesData1,
  to_dt: '2023-08-03',
  from_dt: '2023-08-01',
  num_days: 3,
});

export const perDiemFormValuesData8: PerDiemFormValue = deepFreeze({
  currencyObj: currencyObjData6,
  paymentMode: multiplePaymentModesData[0],
  sub_category: orgCategoryData1[0],
  per_diem_rate: perDiemRatesData1,
  purpose: 'test_term',
  num_days: 3,
  report: null,
  from_dt: '2023-08-01',
  to_dt: '2023-08-03',
  billable: true,
  costCenter: costCentersData2[0],
  project: projects[0],
  custom_inputs: [],
  project_dependent_fields: [
    {
      id: 206206,
      mandatory: false,
      name: 'pub create hola 1',
      options: [],
      placeholder: 'pub create hola 1',
      prefix: '',
      type: 'LOCATION',
      value: null,
      label: 'location1',
    },
  ],
  cost_center_dependent_fields: [],
});

export const perDiemFormValuesData9: PerDiemFormValue = deepFreeze({
  currencyObj: currencyObjData6,
  paymentMode: multiplePaymentModesData[0],
  sub_category: undefined,
  per_diem_rate: perDiemRatesData1,
  purpose: 'test_term',
  num_days: 3,
  report: null,
  from_dt: '2023-08-01',
  to_dt: '2023-08-03',
  billable: true,
  costCenter: costCentersData2[0],
  project: projects[0],
  custom_inputs: [],
  project_dependent_fields: [],
  cost_center_dependent_fields: [],
});

export const perDiemFormValuesData10: PerDiemFormValue = deepFreeze({
  ...perDiemFormValuesData8,
  custom_inputs: [
    {
      id: 218266,
      options: [],
      placeholder: 'Enter Date',
      type: 'DATE',
      value: null,
      mandatory: undefined,
      name: undefined,
      prefix: undefined,
      parent_field_id: null,
      displayValue: null,
    },
    {
      id: 218266,
      options: [],
      placeholder: 'Enter Date',
      type: 'DATE',
      value: null,
      mandatory: undefined,
      name: undefined,
      prefix: undefined,
      parent_field_id: null,
      displayValue: null,
    },
  ],
});
