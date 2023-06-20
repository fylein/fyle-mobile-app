import { FlattenedAccount } from '../models/flattened-account.model';

export const dataErtpTransformed = {
  '': {
    search_document:
      "'46040':4 'a':8,14,20,26 'abhishek':32 'ajain@fyle.in':34 'business':11,17,23,29 'c/2022/10/r/37':5 'director':6 'indeed':13,19,25,31 'inr':3 'jain':33 'long':10,16,22,28 'mumbai':7 'report':2 'testing':1 'unit':12,18,24,30 'very':9,15,21,27",
  },
  approved: {
    by: null,
  },
  ou: {
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department: '0000000',
    department_id: 'deptpmQ0SsMO0S',
    employee_id: '',
    id: 'ouX8dwsbLCLv',
    level: 123,
    level_id: 'lvlPtroPaClQy',
    location: 'Mumbai',
    mobile: '123456',
    org_id: 'orNVthTo2Zyo',
    org_name: 'Staging Loaded',
    status: '"ACTIVE"',
    sub_department: null,
    title: 'director',
  },
  report: {
    approvals: null,
  },
  rp: {
    amount: 46040,
    approval_state: null,
    approved_at: null,
    claim_number: 'C/2022/10/R/37',
    created_at: new Date('2022-10-31T13:54:46.317Z'),
    currency: 'USD',
    exported: false,
    from_dt: null,
    id: 'rptkwzhsieIY',
    locations: [],
    manual_flag: false,
    num_transactions: 4,
    org_user_id: 'ouX8dwsbLCLv',
    physical_bill: false,
    physical_bill_at: null,
    policy_flag: false,
    purpose: 'My Testing Report',
    state: 'APPROVAL_PENDING',
    reimbursed_at: null,
    risk_state: null,
    risk_state_expense_count: null,
    settlement_id: null,
    to_dt: null,
    trip_request_id: null,
    type: 'EXPENSE',
    verification_state: null,
    verified: false,
  },
  sequential: {
    approval_turn: false,
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
  },
};

export const apiErptReporDataParam = {
  '': {
    search_document:
      "'46040':4 'a':8,14,20,26 'abhishek':32 'ajain@fyle.in':34 'business':11,17,23,29 'c/2022/10/r/37':5 'director':6 'indeed':13,19,25,31 'inr':3 'jain':33 'long':10,16,22,28 'mumbai':7 'report':2 'testing':1 'unit':12,18,24,30 'very':9,15,21,27",
  },
  approved: {
    by: null,
  },
  ou: {
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department: '0000000',
    department_id: 'deptpmQ0SsMO0S',
    employee_id: '',
    id: 'ouX8dwsbLCLv',
    level: 123,
    level_id: 'lvlPtroPaClQy',
    location: 'Mumbai',
    mobile: '123456',
    org_id: 'orNVthTo2Zyo',
    org_name: 'Staging Loaded',
    status: '"ACTIVE"',
    sub_department: null,
    title: 'director',
  },
  report: {
    approvals: null,
  },
  rp: {
    amount: 46040,
    approval_state: null,
    approved_at: null,
    claim_number: 'C/2022/10/R/37',
    created_at: new Date('2022-10-31T13:54:46.317Z'),
    currency: 'USD',
    exported: false,
    from_dt: null,
    id: 'rptkwzhsieIY',
    locations: [],
    manual_flag: false,
    num_transactions: 4,
    org_user_id: 'ouX8dwsbLCLv',
    physical_bill: false,
    physical_bill_at: null,
    policy_flag: false,
    purpose: 'My Testing Report',
    state: 'APPROVAL_PENDING',
    reimbursed_at: null,
    risk_state: null,
    risk_state_expense_count: null,
    settlement_id: null,
    to_dt: null,
    trip_request_id: null,
    type: 'EXPENSE',
    verification_state: null,
    verified: false,
  },
  sequential: {
    approval_turn: false,
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
  },
};

export const flattenedData: FlattenedAccount = {
  acc_id: 'acct0vTdfNQrT',
  acc_created_at: '2019-09-19T10:19:37.764Z',
  acc_updated_at: '2023-03-10T11:29:40.049Z',
  acc_name: 'Personal Account',
  acc_type: 'PERSONAL_ACCOUNT',
  acc_currency: 'INR',
  acc_target_balance_amount: 0,
  acc_current_balance_amount: -65.060000000006,
  acc_tentative_balance_amount: -67645301481.37274,
  acc_category: 'category1',
  ou_id: 'ourw7Hi4mmpO',
  ou_org_id: 'orNVthTo2Zyo',
  us_email: 'dimple.kh@fyle.in',
  us_full_name: 'Dimple',
  org_id: 'oRg123',
  org_domain: 'staging.in',
  advance_purpose: 'Testing',
  advance_number: 1234,
  orig_currency: 'INR',
  currency: 'INR',
  orig_amount: 2500,
  amount: 2500,
  advance_id: 'aDvId123',
};

export const unflattenedData = {
  acc: {
    id: 'acct0vTdfNQrT',
    created_at: '2019-09-19T10:19:37.764Z',
    updated_at: '2023-03-10T11:29:40.049Z',
    name: 'Personal Account',
    type: 'PERSONAL_ACCOUNT',
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: -65.060000000006,
    tentative_balance_amount: -67645301481.37274,
    category: 'category1',
  },
  ou: {
    id: 'ourw7Hi4mmpO',
    org_id: 'orNVthTo2Zyo',
  },
  us: {
    email: 'dimple.kh@fyle.in',
    full_name: 'Dimple',
  },
  org: {
    id: 'oRg123',
    domain: 'staging.in',
  },
  advance: {
    purpose: 'Testing',

    // eslint-disable-next-line id-blacklist
    number: 1234,
    id: 'aDvId123',
  },
  orig: {
    currency: 'INR',
    amount: 2500,
  },
  currency: 'INR',
  amount: 2500,
};
