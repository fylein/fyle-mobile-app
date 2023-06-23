import { SplitExpense } from '../models/split-expense.model';

export const splitExpense1: SplitExpense = {
  amount: 15000,
  currency: 'INR',
  percentage: 60,
  txn_dt: new Date('2023-06-14'),
  project: {
    ap1_email: null,
    ap1_full_name: null,
    ap2_email: null,
    ap2_full_name: null,
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '1397',
    project_created_at: new Date('2021-04-14T01:59:24.553Z'),
    project_description: 'NetSuite Customer / Project - 3M, Id - 1397',
    project_id: 247935,
    project_name: '3M',
    project_org_category_ids: [16557, 16558, 16559, 16560, 16561],
    project_org_id: 'orNVthTo2Zyo',
    project_updated_at: new Date('2023-03-18T00:34:50.217Z'),
    projectv2_name: '3M',
    sub_project_name: null,
  },
};

export const splitExpense2: SplitExpense = {
  amount: 2160,
  currency: 'INR',
  percentage: 60,
  txn_dt: new Date('2023-06-14'),
  category: {
    code: null,
    created_at: new Date('2019-01-07T11:12:02.164897+00:00'),
    displayName: '1',
    enabled: true,
    fyle_category: 'Airlines',
    id: 51722,
    name: '1',
    org_id: 'orNVthTo2Zyo',
    sub_category: '1',
    updated_at: new Date('2023-04-17T12:55:49.475665+00:00'),
  },
};
