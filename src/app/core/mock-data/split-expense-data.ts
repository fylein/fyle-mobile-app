import * as dayjs from 'dayjs';
import { SplitExpense } from '../models/split-expense.model';

export const splitExpense1: SplitExpense = {
  amount: 15000,
  currency: 'INR',
  percentage: 60,
  txn_dt: '2023-06-14',
  project: {
    ap1_email: null,
    ap1_full_name: null,
    ap2_email: null,
    ap2_full_name: null,
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '1397',
    project_created_at: '2021-04-14T01:59:24.553Z',
    project_description: 'NetSuite Customer / Project - 3M, Id - 1397',
    project_id: 247935,
    project_name: '3M',
    project_org_category_ids: [16557, 16558, 16559, 16560, 16561],
    project_org_id: 'orNVthTo2Zyo',
    project_updated_at: '2023-03-18T00:34:50.217Z',
    projectv2_name: '3M',
    sub_project_name: null,
  },
};

export const splitExpense2: SplitExpense = {
  amount: 2160,
  currency: 'INR',
  percentage: 60,
  txn_dt: '2023-06-14',
  category: {
    code: null,
    created_at: '2019-01-07T11:12:02.164897+00:00',
    displayName: '1',
    enabled: true,
    fyle_category: 'Airlines',
    id: 51722,
    name: '1',
    org_id: 'orNVthTo2Zyo',
    sub_category: '1',
    updated_at: '2023-04-17T12:55:49.475665+00:00',
  },
};

export const splitExpense3 = {
  amount: 2000,
  currency: 'INR',
  percentage: 50,
  txn_dt: '2023-02-08',
  category: '',
};

export const splitExpense4 = {
  amount: 2000,
  currency: 'INR',
  percentage: 50,
  txn_dt: dayjs(new Date()).format('YYYY-MM-DD'),
  category: '',
};

export const splitExpense5 = {
  amount: 2000,
  currency: 'INR',
  percentage: 50,
  txn_dt: '2023-02-08',
  project: '',
};

export const splitExpense6 = {
  amount: 2000,
  currency: 'INR',
  percentage: 50,
  txn_dt: '2023-02-08',
  cost_center: '',
};

export const splitExpense7 = {
  ...splitExpense3,
  amount: null,
  currency: null,
  percentage: null,
};

export const splitExpenseDataWithProject: SplitExpense = {
  amount: 120,
  currency: 'INR',
  percentage: 60,
  category: {
    code: null,
    created_at: '2019-01-07T11:12:02.164897+00:00',
    displayName: '1',
    enabled: true,
    fyle_category: 'Airlines',
    id: 184692,
    name: '1',
    org_id: 'orNVthTo2Zyo',
    sub_category: '1',
    updated_at: '2023-04-17T12:55:49.475665+00:00',
  },
  project: {
    ap1_email: null,
    ap1_full_name: null,
    ap2_email: null,
    ap2_full_name: null,
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: 'P103',
    project_created_at: '2023-01-17T01:30:51.865Z',
    project_description: null,
    project_id: 384582,
    project_name: 'Project 103 / Sub 103',
    project_org_category_ids: [
      214309, 214310, 214311, 214312, 214313, 214314, 214315, 214316, 214317, 214318, 214319, 214320, 214321, 214322,
      214323, 214324, 214325, 214326, 214327, 214328, 214329, 214330, 214331, 214332, 214333, 214334, 222255, 222256,
      247971, 247972, 247973, 247974, 247975, 247976, 247977, 247978, 247979, 247980, 247981, 247982, 247983, 247984,
      247985, 247986, 247987, 247988, 247989, 247990, 247991, 247992, 247993, 247994, 247995, 247996, 247997, 247998,
      247999, 248000, 248001, 248002, 248003, 248004, 248005, 248006, 248007, 248008, 248009, 248010, 248011, 248012,
      248013, 248014, 248015, 248016, 248017, 248018, 248019, 248020, 248021, 248022, 248023, 248024, 248025, 248026,
      248027, 248028, 248029, 248030, 248031, 248032, 248033, 248034, 248035, 248036, 248037, 248038, 248039, 248040,
      248041, 248042,
    ],
    project_org_id: 'orOTDe765hQp',
    project_updated_at: '2023-07-19T06:48:13.406Z',
    projectv2_name: 'Project 103',
    sub_project_name: 'Sub 103',
  },
  txn_dt: '2023-08-10',
};

export const splitExpenseDataWithProject2: SplitExpense = {
  ...splitExpenseDataWithProject,
  project: undefined,
};

export const splitExpenseDataWithCostCenter: SplitExpense = {
  ...splitExpenseDataWithProject,
  project: undefined,
  cost_center: {
    active: true,
    code: '123',
    created_at: '2023-01-04T04:00:32.338131+00:00',
    description: '123',
    id: 384582,
    name: '2qw3e',
    org_id: 'orOTDe765hQp',
    updated_at: '2023-01-04T04:00:32.338131+00:00',
  },
};

export const splitExpenseDataWithCostCenter2: SplitExpense = {
  ...splitExpenseDataWithCostCenter,
  cost_center: undefined,
};
