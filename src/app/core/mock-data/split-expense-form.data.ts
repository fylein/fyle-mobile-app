import { FormControl, FormGroup } from '@angular/forms';

export const splitExpenseFormData1 = new FormGroup({
  amount: new FormControl(120),
  currency: new FormControl('INR'),
  percentage: new FormControl(60),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData2 = new FormGroup({
  amount: new FormControl(),
  currency: new FormControl('INR'),
  percentage: new FormControl(60),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData3 = new FormGroup({
  amount: new FormControl(120),
  currency: new FormControl('INR'),
  percentage: new FormControl(),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData4 = new FormGroup({
  amount: new FormControl(800),
  currency: new FormControl('INR'),
  percentage: new FormControl(40),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData5 = new FormGroup({
  amount: new FormControl(800),
  currency: new FormControl('INR'),
  percentage: new FormControl(90),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData6 = new FormGroup({
  amount: new FormControl(80),
  currency: new FormControl('INR'),
  percentage: new FormControl(96),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData7 = new FormGroup({
  amount: new FormControl(80),
  currency: new FormControl('INR'),
  percentage: new FormControl(96),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl({
    code: null,
    created_at: '2023-05-08T10:32:49.142566+00:00',
    displayName: 'Food',
    enabled: true,
    fyle_category: 'Food',
    id: 256621,
    name: 'Food',
    org_id: 'orNbIQloYtfa',
    sub_category: 'Food',
    updated_at: '2024-01-18T08:11:42.313617+00:00',
  }),
  project: new FormControl({
    ap1_email: null,
    ap1_full_name: null,
    ap2_email: null,
    ap2_full_name: null,
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: null,
    project_created_at: '2023-12-18T02:01:14.842Z',
    project_description: null,
    project_id: 325126,
    project_name: 'Project 1',
    project_org_category_ids: [256621, 256627, 256633],
    project_org_id: 'orNbIQloYtfa',
    project_updated_at: '2024-01-13T04:18:53.330Z',
    projectv2_name: 'Project 1',
    sub_project_name: null,
  }),
  cost_center: new FormControl({
    active: true,
    code: null,
    created_at: '2023-12-13T09:20:18.568121+00:00',
    description: null,
    id: 20424,
    name: 'Cost Center 1',
    org_id: 'orNbIQloYtfa',
    updated_at: '2024-01-10T16:48:41.754415+00:00',
  }),
});
