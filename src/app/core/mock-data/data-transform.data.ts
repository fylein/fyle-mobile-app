import deepFreeze from 'deep-freeze-strict';

export const dataErtpTransformed = deepFreeze({
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
    policy_flag: false,
    purpose: 'My Testing Report',
    state: 'APPROVAL_PENDING',
    reimbursed_at: null,
    risk_state: null,
    risk_state_expense_count: null,
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
});

export const apiErptReporDataParam = deepFreeze({
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
    policy_flag: false,
    purpose: 'My Testing Report',
    state: 'APPROVAL_PENDING',
    reimbursed_at: null,
    risk_state: null,
    risk_state_expense_count: null,
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
});

export const flattenedData = deepFreeze({
  tx_id: 'txLC4ME4OLjp',
  tx_org_user_id: 'ou6cE4dCLH8d',
  tx_created_at: new Date('2023-09-13T08:27:11.922Z'),
  tx_amount: 1010,
  tx_currency: 'USD',
  tx_state: 'COMPLETE',
  tx_purpose: 'Client Meeting',
  tx_vendor: 'Uber',
  tx_vendor_id: 66,
  tx_org_category: 'Taxi',
  tx_fyle_category: 'Taxi',
  tx_org_category_id: 256623,
  tx_expense_number: 'E/2023/09/T/1',
  us_full_name: 'devendra',
  us_email: 'devendra.r@fyle.in',
  source_account_type: 'PERSONAL_ACCOUNT',
  source_account_id: 'accO6abI7gZ6T',
});

export const unflattenedData = deepFreeze({
  tx: {
    id: 'txLC4ME4OLjp',
    org_user_id: 'ou6cE4dCLH8d',
    created_at: new Date('2023-09-13T08:27:11.922Z'),
    amount: 1010,
    currency: 'USD',
    state: 'COMPLETE',
    purpose: 'Client Meeting',
    vendor: 'Uber',
    vendor_id: 66,
    org_category: 'Taxi',
    fyle_category: 'Taxi',
    org_category_id: 256623,
    expense_number: 'E/2023/09/T/1',
  },
  us: {
    full_name: 'devendra',
    email: 'devendra.r@fyle.in',
  },
  source: {
    account_type: 'PERSONAL_ACCOUNT',
    account_id: 'accO6abI7gZ6T',
  },
});
