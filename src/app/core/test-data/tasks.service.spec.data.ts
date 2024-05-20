import deepFreeze from 'deep-freeze-strict';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

export const potentialDuplicatesApiResponse = deepFreeze([
  { transaction_ids: ['tx3I0ccSGlhg', 'txvAmVCGZUZi'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['tx3rq5G9gzgf', 'txS1cDov9iZn'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['tx6KauIKfjdJ', 'txT0ZmCrVOiD'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['tx6KauIKfjdJ', 'txws78AoalC9', 'txzjWIcqYxa9'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['tx86H1wDT5aK', 'txQYb76PXaC8', 'txWTiNPneIW5'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['tx96W9dASsje', 'txJVuyoiir2c', 'txqcNXONJpiR'], fields: ['amount', 'currency', 'txn_dt'] },
  {
    transaction_ids: ['txeG0ozaWXAv', 'txi5sCnM706r', 'txJfGPgyDQTj', 'txQhnRluTgSl', 'txtJUQJBvTiv'],
    fields: ['amount', 'currency', 'txn_dt'],
  },
  { transaction_ids: ['txfQtm19a26X', 'txOoNP4AguMY'], fields: ['amount', 'currency', 'txn_dt'] },
  {
    transaction_ids: ['txiqfeRdVP58', 'txKe7x7WoEfg', 'txvQepZO5jiw', 'txxSrpiC5Eaz'],
    fields: ['amount', 'currency', 'txn_dt'],
  },
  { transaction_ids: ['txivvQdKDGfZ', 'txvqhZ4SRBx9'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['txjh5iDt7xXO', 'txkJsHIF6a9X'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['txT0ZmCrVOiD', 'txws78AoalC9'], fields: ['amount', 'currency', 'txn_dt'] },
  { transaction_ids: ['txT0ZmCrVOiD', 'txzjWIcqYxa9'], fields: ['amount', 'currency', 'txn_dt'] },
]);

export const extendedOrgUserResponse: ExtendedOrgUser = deepFreeze({
  ou: {
    id: 'out3t2X258rd',
    created_at: new Date('2019-02-04T10:26:36.877Z'),
    org_id: 'orrjqbDbeP9p',
    user_id: 'usN0bYiJRI5V',
    employee_id: 'ouE1vAIIxhaA',
    location: 'indiax',
    level: null,
    level_id: 'lvlPtroPaClQy',
    band: null,
    rank: null,
    business_unit: null,
    department_id: null,
    department: null,
    sub_department: null,
    roles: ['FYLER', 'APPROVER', 'PAYMENT_PROCESSOR', 'ADMIN'],
    approver1_id: 'ouE1vAIIx0fA',
    approver2_id: null,
    approver3_id: null,
    delegatee_id: null,
    delegation_start_at: new Date('2021-11-29T18:01:25.502Z'),
    delegation_end_at: null,
    title: 'se',
    status: 'ACTIVE',
    branch_ifsc: 'SBIN0000123',
    branch_account: 'asdasd',
    mobile: '+917686958963',
    mobile_verified: true,
    mobile_verified_at: new Date('2021-02-08T06:25:26.549Z'),
    mobile_verification_attempts_left: 4,
    is_primary: true,
    owner: null,
    joining_dt: null,
    special_email: 'receipts+aiyush_dhar@fyle.ai',
    custom_field_values: [
      {
        id: 60,
        name: 'testing',
        value: 'huehue testing',
      },
      {
        id: 38,
        name: 'Permanent Residential Address',
        value: null,
      },
      {
        id: 41,
        name: 'Nationality',
        value: 'Indian',
      },
      {
        id: 40,
        name: 'Previous work Experience',
        value: null,
      },
      {
        id: 502,
        name: 'employee id',
        value: null,
      },
      {
        id: 608,
        name: 'Driver salary limit',
        value: null,
      },
      {
        id: 460,
        name: 'multi',
        value: '',
      },
      {
        id: 46,
        name: 'Permanent Residence City',
        value: {
          display: 'Kolkata',
        },
      },
      {
        id: 418,
        name: 'loc',
        value: null,
      },
      {
        id: 453,
        name: 'loc898',
        value: null,
      },
      {
        id: 503,
        name: 'location',
        value: null,
      },
      {
        id: 501,
        name: 'tets date',
        value: null,
      },
      {
        id: 572,
        name: 'date field',
        value: '2021-09-07T18:30:00.000Z',
      },
      {
        id: 59,
        name: 'Test',
        value: false,
      },
    ],
    org_name: 'Fyle Staging',
    settings_id: 'ousC7BdSJk83D',
    default_cost_center_id: 58,
    default_cost_center_name: 'C1',
    default_cost_center_code: 'sdh',
    cost_center_ids: [2422, 2423, 11725, 11726],
  },
  org: {
    domain: 'fyledemo.com',
    currency: 'INR',
  },
  us: {
    id: 'usN0bYiJRI5V',
    created_at: new Date('2019-02-04T10:26:36.763Z'),
    full_name: 'Aiyush',
    email: 'aiyush.dhar@fyle.in',
    email_verified_at: new Date('2022-02-16T14:46:36.686Z'),
    onboarded: true,
  },
  ap1: {
    full_name: 'naveen.s@fyle.in',
    email: 'naveen.s@fyle.in',
  },
  ap2: {
    full_name: null,
    email: null,
  },
  ap3: {
    full_name: null,
    email: null,
  },
  bb: {
    bank_name: 'STATE BANK OF INDIA',
  },
  dwolla: {
    customer_id: 'dwc8ZDUdZeUHhrI',
    bank_account_added: true,
  },
});

export const extendedOrgUserResponseSpender: ExtendedOrgUser = deepFreeze({
  ...extendedOrgUserResponse,
  ou: {
    ...extendedOrgUserResponse.ou,
    roles: ['FYLER'],
  },
});

export const teamReportResponse = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(rp_id)',
        function_value: 2,
      },
      {
        function_name: 'sum(rp_amount)',
        function_value: 733479.83,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const sentBackResponse = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(rp_id)',
        function_value: 1,
      },
      {
        function_name: 'sum(rp_amount)',
        function_value: 44.53,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const unsubmittedReportsResponse = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(rp_id)',
        function_value: 2,
      },
      {
        function_name: 'sum(rp_amount)',
        function_value: 0,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const allExtendedReportsResponse = deepFreeze([
  {
    _search_document:
      "'1':1 '2022':3 '44.53':5 'aiyush':9 'aiyush.dhar@fyle.in':10 'c/2022/11/r/2':6 'indiax':8 'inr':4 'oct':2 'se':7",
    approved_by: ['ouE1vAIIx0fA'],
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'out3t2X258rd',
    ou_level: null,
    ou_level_id: null,
    ou_location: 'indiax',
    ou_mobile: '+917686958963',
    ou_org_id: 'orrjqbDbeP9p',
    ou_org_name: 'Fyle Staging',
    ou_status: '"ACTIVE"',
    ou_sub_department: null,
    ou_title: 'se',
    report_approvals: {
      ouE1vAIIx0fA: {
        rank: 97,
        state: 'APPROVAL_PENDING',
      },
    },
    rp_amount: 44.53,
    rp_approval_state: null,
    rp_approved_at: null,
    rp_claim_number: 'C/2022/11/R/2',
    rp_created_at: new Date('2022-11-18T08:40:29.609972'),
    rp_currency: 'INR',
    rp_exported: false,
    rp_from_dt: null,
    rp_id: 'rpHYxgGIqjnB',
    rp_locations: [],
    rp_manual_flag: false,
    rp_num_transactions: 2,
    rp_org_user_id: 'out3t2X258rd',
    rp_physical_bill: false,
    rp_physical_bill_at: null,
    rp_policy_flag: false,
    rp_purpose: '#1:  Oct 2022',
    rp_reimbursed_at: null,
    rp_risk_state: null,
    rp_risk_state_expense_count: null,
    rp_settlement_id: null,
    rp_source: 'MOBILE',
    rp_state: 'APPROVER_INQUIRY',
    rp_submitted_at: new Date('2022-11-18T08:40:30.963'),
    rp_tax: 0,
    rp_to_dt: null,
    rp_trip_request_id: null,
    rp_type: 'EXPENSE',
    rp_verification_state: null,
    rp_verified: false,
    sequential_approval_turn: false,
    us_email: 'aiyush.dhar@fyle.in',
    us_full_name: 'Aiyush',
  },
  {
    _search_document:
      "'0':7 '2':2 '2021':5 'aiyush':11 'aiyush.dhar@fyle.in':12 'c/2021/11/r/3':8 'indiax':10 'inr':6 'kolhapur':3 'nov':4 'se':9 'trip':1",
    approved_by: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'out3t2X258rd',
    ou_level: null,
    ou_level_id: null,
    ou_location: 'indiax',
    ou_mobile: '+917686958963',
    ou_org_id: 'orrjqbDbeP9p',
    ou_org_name: 'Fyle Staging',
    ou_status: '"ACTIVE"',
    ou_sub_department: null,
    ou_title: 'se',
    report_approvals: null,
    rp_amount: 0,
    rp_approval_state: null,
    rp_approved_at: null,
    rp_claim_number: 'C/2021/11/R/3',
    rp_created_at: new Date('2021-11-11T11:50:53.85763'),
    rp_currency: 'INR',
    rp_exported: false,
    rp_from_dt: new Date('2021-11-11T06:30:00'),
    rp_id: 'rpz1LhNLf10p',
    rp_locations: [
      '(Kolhapur,Maharashtra,India,null,"Kolhapur, Maharashtra, India","Kolhapur, Maharashtra, India",16.7049873,74.24325270000001)',
    ],
    rp_manual_flag: false,
    rp_num_transactions: 0,
    rp_org_user_id: 'out3t2X258rd',
    rp_physical_bill: false,
    rp_physical_bill_at: null,
    rp_policy_flag: false,
    rp_purpose: 'Trip #2: (Kolhapur), Nov 2021',
    rp_reimbursed_at: null,
    rp_risk_state: null,
    rp_risk_state_expense_count: null,
    rp_settlement_id: null,
    rp_source: 'WEBAPP',
    rp_state: 'DRAFT',
    rp_submitted_at: null,
    rp_tax: null,
    rp_to_dt: new Date('2021-11-18T06:30:00'),
    rp_trip_request_id: 'qwe',
    rp_type: 'TRIP',
    rp_verification_state: null,
    rp_verified: false,
    sequential_approval_turn: false,
    us_email: 'aiyush.dhar@fyle.in',
    us_full_name: 'Aiyush',
  },
  {
    _search_document:
      "'0':5 '1':1 '2021':3 'aiyush':9 'aiyush.dhar@fyle.in':10 'c/2021/10/r/4':6 'indiax':8 'inr':4 'oct':2 'se':7",
    approved_by: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'out3t2X258rd',
    ou_level: null,
    ou_level_id: null,
    ou_location: 'indiax',
    ou_mobile: '+917686958963',
    ou_org_id: 'orrjqbDbeP9p',
    ou_org_name: 'Fyle Staging',
    ou_status: '"ACTIVE"',
    ou_sub_department: null,
    ou_title: 'se',
    report_approvals: null,
    rp_amount: 0,
    rp_approval_state: null,
    rp_approved_at: null,
    rp_claim_number: 'C/2021/10/R/4',
    rp_created_at: new Date('2021-10-05T13:22:26.145469'),
    rp_currency: 'INR',
    rp_exported: false,
    rp_from_dt: null,
    rp_id: 'rpMrUrB96Y4M',
    rp_locations: [],
    rp_manual_flag: false,
    rp_num_transactions: 0,
    rp_org_user_id: 'out3t2X258rd',
    rp_physical_bill: false,
    rp_physical_bill_at: null,
    rp_policy_flag: false,
    rp_purpose: '#1:  Oct 2021',
    rp_reimbursed_at: null,
    rp_risk_state: null,
    rp_risk_state_expense_count: null,
    rp_settlement_id: null,
    rp_source: 'WEBAPP',
    rp_state: 'DRAFT',
    rp_submitted_at: null,
    rp_tax: null,
    rp_to_dt: null,
    rp_trip_request_id: null,
    rp_type: 'EXPENSE',
    rp_verification_state: null,
    rp_verified: false,
    sequential_approval_turn: false,
    us_email: 'aiyush.dhar@fyle.in',
    us_full_name: 'Aiyush',
  },
  {
    _search_document:
      "'0':5 '1':1 '2021':3 'aiyush':9 'aiyush.dhar@fyle.in':10 'c/2021/03/r/8':6 'indiax':8 'inr':4 'mar':2 'se':7",
    approved_by: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'out3t2X258rd',
    ou_level: null,
    ou_level_id: null,
    ou_location: 'indiax',
    ou_mobile: '+917686958963',
    ou_org_id: 'orrjqbDbeP9p',
    ou_org_name: 'Fyle Staging',
    ou_status: '"ACTIVE"',
    ou_sub_department: null,
    ou_title: 'se',
    report_approvals: null,
    rp_amount: 0,
    rp_approval_state: null,
    rp_approved_at: null,
    rp_claim_number: 'C/2021/03/R/8',
    rp_created_at: new Date('2021-03-04T05:18:11.083888'),
    rp_currency: 'INR',
    rp_exported: false,
    rp_from_dt: null,
    rp_id: 'rpTst4dXH72B',
    rp_locations: [],
    rp_manual_flag: false,
    rp_num_transactions: 0,
    rp_org_user_id: 'out3t2X258rd',
    rp_physical_bill: true,
    rp_physical_bill_at: new Date('2021-03-04T05:18:11.463'),
    rp_policy_flag: false,
    rp_purpose: '#1:  Mar 2021',
    rp_reimbursed_at: null,
    rp_risk_state: null,
    rp_risk_state_expense_count: {
      high_risk: 0,
      moderate_risk: 0,
      no_risk: 0,
    },
    rp_settlement_id: null,
    rp_source: 'WEBAPP',
    rp_state: 'APPROVER_PENDING',
    rp_submitted_at: new Date('2021-03-04T05:18:11.809'),
    rp_tax: 0,
    rp_to_dt: null,
    rp_trip_request_id: null,
    rp_type: 'EXPENSE',
    rp_verification_state: null,
    rp_verified: false,
    sequential_approval_turn: false,
    us_email: 'aiyush.dhar@fyle.in',
    us_full_name: 'Aiyush',
  },
]);

export const unreportedExpensesResponse = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 13,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 142258.932845,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const incompleteExpensesResponse = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 161,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 132573333762.37189,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const sentBackAdvancesResponse = deepFreeze({
  count: 5,
  total_amount: 123370000,
});
