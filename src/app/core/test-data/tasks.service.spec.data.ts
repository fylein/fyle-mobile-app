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
