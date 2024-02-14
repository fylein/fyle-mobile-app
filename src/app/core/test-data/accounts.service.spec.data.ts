/* eslint-disable id-blacklist */
import { AccountType } from '../enums/account-type.enum';
import { ExpenseType } from '../enums/expense-type.enum';
import { unflattenedTxn } from '../mock-data/unflattened-expense.data';
import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import { ExtendedAccount } from '../models/extended-account.model';
import { OrgSettings } from '../models/org-settings.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';

export const account1Data = {
  acc_id: 'accfziaxbGFVW',
  acc_created_at: new Date('2018-10-08T07:04:42.753Z'),
  acc_updated_at: new Date('2022-04-27T08:57:52.221Z'),
  acc_name: 'Personal Account',
  acc_type: 'PERSONAL_ACCOUNT',
  acc_currency: 'INR',
  acc_target_balance_amount: 0,
  acc_current_balance_amount: 0e-13,
  acc_tentative_balance_amount: -5620222.5860540000395,
  acc_category: null,
  ou_id: 'ouCI4UQ2G0K1',
  ou_org_id: 'orrjqbDbeP9p',
  us_email: 'ajain@fyle.in',
  us_full_name: 'abhishek',
  org_id: null,
  org_domain: null,
  advance_purpose: null,
  advance_number: null,
  orig_currency: null,
  currency: null,
  orig_amount: null,
  amount: null,
  advance_id: null,
};

export const unflattenedAccount1Data = {
  acc: {
    id: 'accfziaxbGFVW',
    created_at: new Date('2018-10-08T07:04:42.753Z'),
    updated_at: new Date('2022-04-27T08:57:52.221Z'),
    name: 'Personal Account',
    type: AccountType.PERSONAL,
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: -5620222.586054,
    category: null,
  },
  ou: {
    id: 'ouCI4UQ2G0K1',
    org_id: 'orrjqbDbeP9p',
  },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  advance: {
    purpose: null,
    number: null,
    id: null,
  },
  orig: { currency: null, amount: null },
  currency: null,
  amount: null,
};

export const account2Data = {
  acc_id: 'acct0IxPgGvLa',
  acc_created_at: new Date('2018-11-05T18:35:59.912Z'),
  acc_updated_at: new Date('2021-09-29T19:35:23.965Z'),
  acc_name: 'Advance Account',
  acc_type: 'PERSONAL_ADVANCE_ACCOUNT',
  acc_currency: 'INR',
  acc_target_balance_amount: 0,
  acc_current_balance_amount: 0.0,
  acc_tentative_balance_amount: 0.0,
  acc_category: null,
  ou_id: 'ouCI4UQ2G0K1',
  ou_org_id: 'orrjqbDbeP9p',
  us_email: 'ajain@fyle.in',
  us_full_name: 'abhishek',
  org_id: null,
  org_domain: null,
  advance_purpose: 'ddsfd',
  advance_number: 'A/2020/03/T/2',
  orig_currency: null,
  currency: 'INR',
  orig_amount: null,
  amount: 800000,
  advance_id: 'advT96eCXZtCo',
};

export const unflattenedAccount2Data = {
  acc: {
    id: 'acc6mK6CEesGL',
    created_at: new Date('2018-11-15T06:25:00.402Z'),
    updated_at: new Date('2022-09-14T09:20:46.442Z'),
    name: 'Advance Account',
    type: AccountType.ADVANCE,
    currency: 'USD',
    target_balance_amount: 0,
    current_balance_amount: 223146436,
    tentative_balance_amount: 223146386.93,
    category: null,
    displayName: 'Advance (Balance: $223,146,386.93)',
    isReimbursable: false,
  },
  ou: {
    id: 'ouvyOFOSx5bh',
    org_id: 'orrb8EW1zZsy',
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
  },
  org: {
    id: null,
    domain: null,
  },
  advance: {
    purpose: 'erertert',
    number: 'A/2022/03/T/4',
    id: 'adve6o3JdrDbI',
  },
  orig: {
    currency: null,
    amount: null,
  },
  currency: 'USD',
  amount: 23213,
};

export const unflattenedAccount3Data = {
  acc: {
    id: 'acct0IxPgGvLa',
    created_at: new Date('2018-11-05T18:35:59.912Z'),
    updated_at: new Date('2021-09-29T19:35:23.965Z'),
    name: 'Advance Account',
    type: AccountType.ADVANCE,
    currency: 'USD',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
  },
  ou: { id: 'ouCI4UQ2G0K1', org_id: 'orrjqbDbeP9p' },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  advance: { purpose: 'ddsfd', number: 'A/2020/03/T/2', id: 'advT96eCXZtCo' },
  orig: { currency: 'USD', amount: 500 },
  currency: 'USD',
  amount: 800000,
};

export const unflattenedAccount4Data = {
  acc: {
    id: 'acct0IxPgGvLa',
    created_at: new Date('2018-11-05T18:35:59.912Z'),
    updated_at: new Date('2021-09-29T19:35:23.965Z'),
    name: 'Advance Account',
    type: AccountType.ADVANCE,
    currency: 'USD',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
  },
  ou: { id: 'ouCI4UQ2G0K1', org_id: 'orrjqbDbeP9p' },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  advance: { purpose: 'ddsfd', number: 'A/2020/03/T/2', id: 'advT96eCXZtCo' },
  orig: null,
  currency: 'USD',
  amount: 800000,
};

export const unflattenedTransactionPersonal: UnflattenedTransaction = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txbiYbxQUcBv',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2022-02-17T09:06:55.065Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2018-06-25T04:30:00.000Z'),
    category: null,
    amount: 141.96,
    user_amount: 141.96,
    policy_amount: null,
    admin_amount: null,
    tax: null,
    tax_amount: null,
    tax_group_id: null,
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 0,
    invoice_number: null,
    purpose: 'AMAZON.COM, SEATTLE, WA (Card Transaction)',
    source: 'MOBILE',
    billable: false,
    orig_amount: null,
    orig_currency: null,
    project_id: 3943,
    project_name: 'Staging Project',
    project_code: null,
    skip_reimbursement: false,
    creator_id: null,
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: null,
    cost_center_code: null,
    cost_center_id: null,
    source_account_id: 'accZ1IWjhjLyu4',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: false,
    vendor: 'AMAZON.COM',
    vendor_id: 26355,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'Unspecified',
    sub_category: 'Unspecified',
    fyle_category: 'Unspecified',
    org_category_code: null,
    org_category_id: 16582,
    expense_number: 'E/2022/02/T/1362',
    corporate_credit_card_expense_group_id: null,
    split_group_id: null,
    split_group_user_amount: 141.96,
    extracted_data: null,
    user_review_needed: null,
    mandatory_fields_present: true,
    distance: null,
    distance_unit: null,
    from_dt: null,
    to_dt: null,
    num_days: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    mileage_vehicle_type: null,
    mileage_rate: null,
    mileage_is_round_trip: null,
    hotel_is_breakfast_provided: null,
    flight_journey_travel_class: null,
    flight_return_travel_class: null,
    train_travel_class: null,
    bus_travel_class: null,
    taxi_travel_class: null,
    per_diem_rate_id: null,
    activity_policy_pending: null,
    activity_details: null,
    locations: [],
    custom_properties: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
      {
        name: 'test',
        value: [],
      },
      {
        name: 'category2',
        value: [],
      },
      {
        name: 'pub create hola 1',
        value: null,
      },
      {
        name: 'test 112',
        value: null,
      },
      {
        name: '2232323',
        value: null,
      },
      {
        name: 'select all 2',
        value: null,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Unspecified',
    matchCCCId: 'cccekLD25dsJET',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id:
      'A very long Employee ID A very long Employee ID A very long Employee ID A very long Employee ID A very long Employee ID',
    location: null,
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title:
      'A very long title indeed A very long title indeed A very long title indeed A very long title indeed A very long title indeed',
    mobile: '+918080913866',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  },
  tg: {
    name: null,
    percentage: null,
  },
  rp: {
    purpose: null,
    approved_at: null,
    reimbursed_at: null,
    claim_number: null,
  },
  us: {
    full_name: 'Abhishekkk',
    email: 'ajain@fyle.in',
  },
  source: {
    account_type: AccountType.PERSONAL,
    account_id: 'accZ1IWjhjLv4',
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
};

export const paymentModeDataPersonal = {
  acc: {
    id: 'accZ1IWjhjLyu4',
    created_at: new Date('2019-01-11T16:41:56.485Z'),
    updated_at: new Date('2022-11-28T06:43:36.456Z'),
    name: 'Personal Account',
    type: AccountType.PERSONAL,
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
    displayName: 'Personal',
    isReimbursable: false,
  },
  ou: {
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishekkk',
  },
  org: {
    id: null,
    domain: null,
  },
  advance: {
    purpose: null,
    number: null,
    id: null,
  },
  orig: {
    currency: null,
    amount: null,
  },
  currency: null,
  amount: null,
};

export const paymentModeDataPersonal2 = {
  acc: {
    id: 'accZ1IWjhjLyu4',
    created_at: new Date('2019-01-11T16:41:56.485Z'),
    updated_at: new Date('2022-11-28T06:43:36.456Z'),
    name: 'Personal Account',
    type: AccountType.PERSONAL,
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
    displayName: 'Personal',
    isReimbursable: true,
  },
  ou: {
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishekkk',
  },
  org: {
    id: null,
    domain: null,
  },
  advance: {
    purpose: null,
    number: null,
    id: null,
  },
  orig: {
    currency: null,
    amount: null,
  },
  currency: null,
  amount: null,
};

export const unflattenedTransactionCCC: UnflattenedTransaction = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txbiYbxQUcBv',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2022-02-17T09:06:55.065Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2018-06-25T04:30:00.000Z'),
    category: null,
    amount: 141.96,
    user_amount: 141.96,
    policy_amount: null,
    admin_amount: null,
    tax: null,
    tax_amount: null,
    tax_group_id: null,
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 0,
    invoice_number: null,
    purpose: 'AMAZON.COM, SEATTLE, WA (Card Transaction)',
    source: 'CORPORATE_CARD',
    billable: false,
    orig_amount: null,
    orig_currency: null,
    project_id: 3943,
    project_name: 'Staging Project',
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'SYSTEM_CORPORATE_CARD',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: null,
    cost_center_code: null,
    cost_center_id: null,
    source_account_id: 'accZ1IWjhjLv4',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: false,
    vendor: 'AMAZON.COM',
    vendor_id: 26355,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'Unspecified',
    sub_category: 'Unspecified',
    fyle_category: 'Unspecified',
    org_category_code: null,
    org_category_id: 16582,
    expense_number: 'E/2022/02/T/1362',
    corporate_credit_card_expense_group_id: 'cccekLD25dsJET',
    split_group_id: 'txbiYbxQUcBv',
    split_group_user_amount: 141.96,
    extracted_data: null,
    user_review_needed: null,
    mandatory_fields_present: true,
    distance: null,
    distance_unit: null,
    from_dt: null,
    to_dt: null,
    num_days: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    mileage_vehicle_type: null,
    mileage_rate: null,
    mileage_is_round_trip: null,
    hotel_is_breakfast_provided: null,
    flight_journey_travel_class: null,
    flight_return_travel_class: null,
    train_travel_class: null,
    bus_travel_class: null,
    taxi_travel_class: null,
    per_diem_rate_id: null,
    activity_policy_pending: null,
    activity_details: null,
    locations: [],
    custom_properties: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
      {
        name: 'test',
        value: [],
      },
      {
        name: 'category2',
        value: [],
      },
      {
        name: 'pub create hola 1',
        value: null,
      },
      {
        name: 'test 112',
        value: null,
      },
      {
        name: '2232323',
        value: null,
      },
      {
        name: 'select all 2',
        value: null,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Unspecified',
    matchCCCId: 'cccekLD25dsJET',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id:
      'A very long Employee ID A very long Employee ID A very long Employee ID A very long Employee ID A very long Employee ID',
    location: null,
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title:
      'A very long title indeed A very long title indeed A very long title indeed A very long title indeed A very long title indeed',
    mobile: '+918080913866',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  },
  tg: {
    name: null,
    percentage: null,
  },
  rp: {
    purpose: null,
    approved_at: null,
    reimbursed_at: null,
    claim_number: null,
  },
  us: {
    full_name: 'Abhishekkk',
    email: 'ajain@fyle.in',
  },
  source: {
    account_type: AccountType.CCC,
    account_id: 'accZ1IWjhjLv4',
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
};

export const paymentModeDataCCC = {
  acc: {
    id: 'accZ1IWjhjLv4',
    created_at: new Date('2019-01-11T16:41:56.485Z'),
    updated_at: new Date('2022-11-28T06:43:36.456Z'),
    name: 'Corporate Credit Card Account',
    type: AccountType.CCC,
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 120510.16,
    tentative_balance_amount: -24086313828.078266,
    category: null,
    displayName: 'Corporate Card',
    isReimbursable: false,
  },
  ou: {
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishekkk',
  },
  org: {
    id: null,
    domain: null,
  },
  advance: {
    purpose: null,
    number: null,
    id: null,
  },
  orig: {
    currency: null,
    amount: null,
  },
  currency: null,
  amount: null,
};

export const paymentModesData = [
  {
    label: 'Personal Card/Cash',
    value: {
      acc: {
        id: 'acc5APeygFjRd',
        created_at: new Date('2018-02-01T02:32:25.248Z'),
        updated_at: new Date('2022-11-28T06:43:34.735Z'),
        name: 'Personal Account',
        type: AccountType.PERSONAL,
        currency: 'INR',
        target_balance_amount: 0,
        current_balance_amount: 0,
        tentative_balance_amount: -28734189211849.383,
        category: null,
        displayName: 'Personal Card/Cash',
        isReimbursable: true,
      },
      ou: {
        id: 'ouX8dwsbLCLv',
        org_id: 'orNVthTo2Zyo',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishekkk',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: null,
        number: null,
        id: null,
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: null,
      amount: null,
    },
  },
  {
    label: 'Corporate Card',
    value: {
      acc: {
        id: 'accZ1IWjhjLv4',
        created_at: new Date('2019-01-11T16:41:56.485Z'),
        updated_at: new Date('2022-11-28T06:43:36.456Z'),
        name: 'Corporate Credit Card Account',
        type: AccountType.CCC,
        currency: 'INR',
        target_balance_amount: 0,
        current_balance_amount: 120510.16,
        tentative_balance_amount: -24086313828.078266,
        category: null,
        displayName: 'Corporate Card',
        isReimbursable: false,
      },
      ou: {
        id: 'ouX8dwsbLCLv',
        org_id: 'orNVthTo2Zyo',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishekkk',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: null,
        number: null,
        id: null,
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: null,
      amount: null,
    },
  },
  {
    label: 'Paid by Company',
    value: {
      acc: {
        id: 'acc5APeygFjRd',
        created_at: new Date('2018-02-01T02:32:25.248Z'),
        updated_at: new Date('2022-11-28T06:43:34.735Z'),
        name: 'Personal Account',
        type: AccountType.PERSONAL,
        currency: 'INR',
        target_balance_amount: 0,
        current_balance_amount: 0,
        tentative_balance_amount: -28734189211849.383,
        category: null,
        displayName: 'Paid by Company',
        isReimbursable: false,
      },
      ou: {
        id: 'ouX8dwsbLCLv',
        org_id: 'orNVthTo2Zyo',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishekkk',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: null,
        number: null,
        id: null,
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: null,
      amount: null,
    },
  },
];

export const unflattenedTxnWithoutSourceAccountIdData = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txbiYbxQUcBv',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2022-02-17T09:06:55.065Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2018-06-25T04:30:00.000Z'),
    category: null,
    amount: 141.96,
    user_amount: 141.96,
    policy_amount: null,
    admin_amount: null,
    tax: null,
    tax_amount: null,
    tax_group_id: null,
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 0,
    invoice_number: null,
    purpose: 'AMAZON.COM, SEATTLE, WA (Card Transaction)',
    source: null,
    billable: false,
    orig_amount: null,
    orig_currency: null,
    project_id: 3943,
    project_name: 'Staging Project',
    project_code: null,
    skip_reimbursement: false,
    creator_id: null,
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: null,
    cost_center_code: null,
    cost_center_id: null,
    source_account_id: null,
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: false,
    vendor: 'AMAZON.COM',
    vendor_id: 26355,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'Unspecified',
    sub_category: 'Unspecified',
    fyle_category: 'Unspecified',
    org_category_code: null,
    org_category_id: 16582,
    expense_number: 'E/2022/02/T/1362',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'txbiYbxQUcBv',
    split_group_user_amount: null,
    extracted_data: null,
    transcribed_data: null,
    user_review_needed: null,
    mandatory_fields_present: false,
    distance: null,
    distance_unit: null,
    from_dt: null,
    to_dt: null,
    num_days: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    mileage_vehicle_type: null,
    mileage_rate: null,
    mileage_is_round_trip: null,
    hotel_is_breakfast_provided: null,
    flight_journey_travel_class: null,
    flight_return_travel_class: null,
    train_travel_class: null,
    bus_travel_class: null,
    taxi_travel_class: null,
    per_diem_rate_id: null,
    activity_policy_pending: null,
    activity_details: null,
    locations: null,
    custom_properties: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
      {
        name: 'test',
        value: [],
      },
      {
        name: 'category2',
        value: [],
      },
      {
        name: 'pub create hola 1',
        value: null,
      },
      {
        name: 'test 112',
        value: null,
      },
      {
        name: '2232323',
        value: null,
      },
      {
        name: 'select all 2',
        value: null,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Unspecified',
    matchCCCId: null,
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id:
      'A very long Employee ID A very long Employee ID A very long Employee ID A very long Employee ID A very long Employee ID',
    location: null,
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title:
      'A very long title indeed A very long title indeed A very long title indeed A very long title indeed A very long title indeed',
    mobile: '+918080913866',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  },
  tg: {
    name: null,
    percentage: null,
  },
  rp: {
    purpose: null,
    approved_at: null,
    reimbursed_at: null,
    claim_number: null,
  },
  us: {
    full_name: 'Abhishekkk',
    email: 'ajain@fyle.in',
  },
  source: {
    account_type: null,
    account_id: null,
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
};

export const paymentModeDataCCCWithoutAccountProperty = {
  acc: {
    id: 'accZ1IWjhjLv4',
    created_at: new Date('2019-01-11T16:41:56.485Z'),
    updated_at: new Date('2022-11-28T06:43:36.456Z'),
    name: 'Corporate Credit Card Account',
    type: AccountType.CCC,
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 120510.16,
    tentative_balance_amount: -24086313828.078266,
    category: null,
  },
  ou: {
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishekkk',
  },
  org: {
    id: null,
    domain: null,
  },
  advance: {
    purpose: null,
    number: null,
    id: null,
  },
  orig: {
    currency: null,
    amount: null,
  },
  currency: null,
  amount: null,
};

export const paymentModeDataAdvance = {
  acc: {
    id: 'acc6mK6CEesGL',
    created_at: new Date('2018-11-15T06:25:00.402Z'),
    updated_at: new Date('2022-09-14T09:20:46.442Z'),
    name: 'Advance Account',
    type: AccountType.ADVANCE,
    currency: 'USD',
    target_balance_amount: 0,
    current_balance_amount: 223146436,
    tentative_balance_amount: 223146386.93,
    category: null,
    displayName: 'Advance (Balance: $223,146,386.93)',
    isReimbursable: false,
  },
  ou: {
    id: 'ouvyOFOSx5bh',
    org_id: 'orrb8EW1zZsy',
  },
  us: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
  },
  org: {
    id: null,
    domain: null,
  },
  advance: {
    purpose: 'erertert',
    number: 'A/2022/03/T/4',
    id: 'adve6o3JdrDbI',
  },
  orig: {
    currency: null,
    amount: null,
  },
  currency: 'USD',
  amount: 23213,
};

export const paymentModeDataMultipleAdvance = {
  acc: {
    id: 'acct0IxPgGvLa',
    created_at: new Date('2018-11-05T18:35:59.912Z'),
    updated_at: new Date('2021-09-29T19:35:23.965Z'),
    name: 'Advance Account',
    type: AccountType.ADVANCE,
    currency: 'USD',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
    displayName: 'Advance (Balance: undefined)',
    isReimbursable: false,
  },
  ou: { id: 'ouCI4UQ2G0K1', org_id: 'orrjqbDbeP9p' },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  advance: { purpose: 'ddsfd', number: 'A/2020/03/T/2', id: 'advT96eCXZtCo' },
  orig: { currency: 'USD', amount: 500 },
  currency: 'USD',
  amount: 800000,
};

export const paymentModeDataMultipleAdvWithoutOrigAmt = {
  acc: {
    id: 'acct0IxPgGvLa',
    created_at: new Date('2018-11-05T18:35:59.912Z'),
    updated_at: new Date('2021-09-29T19:35:23.965Z'),
    name: 'Advance Account',
    type: AccountType.ADVANCE,
    currency: 'USD',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
    displayName: 'Advance (Balance: undefined)',
    isReimbursable: false,
  },
  ou: { id: 'ouCI4UQ2G0K1', org_id: 'orrjqbDbeP9p' },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  advance: { purpose: 'ddsfd', number: 'A/2020/03/T/2', id: 'advT96eCXZtCo' },
  orig: null,
  currency: 'USD',
  amount: 800000,
};

export const multiplePaymentModesData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-13T13:24:33.814Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 36338.5081,
      tentative_balance_amount: -380009.039763,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'acc6mK6CEesGL',
      created_at: new Date('2018-11-15T06:25:00.402Z'),
      updated_at: new Date('2022-09-14T09:20:46.442Z'),
      name: 'Advance Account',
      type: AccountType.ADVANCE,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 223146436,
      tentative_balance_amount: 223146386.93,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: 'erertert',
      number: 'A/2022/03/T/4',
      id: 'adve6o3JdrDbI',
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: 'USD',
    amount: 23213,
  },
];

export const multiplePaymentModesWithoutAdvData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-13T13:24:33.814Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 36338.5081,
      tentative_balance_amount: -380009.039763,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
];

export const multiplePaymentModesWithoutPersonalAccData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-13T13:24:33.814Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 36338.5081,
      tentative_balance_amount: -380009.039763,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
];

export const multiplePaymentModesWithCompanyAccData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-13T13:24:33.814Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 36338.5081,
      tentative_balance_amount: -380009.039763,
      category: null,
      displayName: 'Corporate Card',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
      displayName: 'Personal Card/Cash',
      isReimbursable: true,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
      displayName: 'Paid by Company',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
];

export const multiplePaymentModesWithoutCCCAccData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
      displayName: 'Personal Card/Cash',
      isReimbursable: true,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
      displayName: 'Paid by Company',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
];

export const multiplePaymentModesIncPersonalAccData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159097.536645,
      category: null,
      displayName: 'Paid by Company',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-13T13:24:33.814Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 36338.5081,
      tentative_balance_amount: -380009.039763,
      category: null,
      displayName: 'Corporate Card',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
];

export const multipleAdvAccountsData: ExtendedAccount[] = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-09T10:16:22.082Z'),
      name: 'Advance Account',
      type: AccountType.ADVANCE,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 223146436,
      tentative_balance_amount: 223146386.93,
      category: null,
      displayName: 'Advance (Balance: $223,146,386.93)',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: 'erertert',
      number: 'A/2022/03/T/4',
      id: 'adve6o3JdrDbI',
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: 'USD',
    amount: 23213,
  },
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-13T13:24:33.814Z'),
      name: 'Advance Account',
      type: AccountType.ADVANCE,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 223146436,
      tentative_balance_amount: 223146386.93,
      category: null,
      displayName: 'Advance (Balance: $223,146,386.93)',
      isReimbursable: false,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: 'erertert',
      number: 'A/2022/03/T/5',
      id: 'adve6o3JdrDbj',
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: 'USD',
    amount: 23213,
  },
];

export const etxnObjData = {
  tx: {
    skip_reimbursement: false,
    source: 'MOBILE',
    txn_dt: new Date('2022-12-20T20:41:40.771Z'),
    currency: 'USD',
    amount: null,
    orig_currency: null,
    orig_amount: null,
    policy_amount: null,
    custom_properties: [],
    num_files: 0,
    org_user_id: 'ouvyOFOSx5bh',
  },
  dataUrls: [],
};

export const etxnObjWithSourceData = {
  tx: {
    skip_reimbursement: true,
    source: 'MOBILE',
    txn_dt: new Date('2022-12-20T20:41:40.771Z'),
    currency: 'USD',
    amount: null,
    orig_currency: null,
    orig_amount: null,
    policy_amount: null,
    custom_properties: [],
    num_files: 0,
    org_user_id: 'ouvyOFOSx5bh',
  },
  dataUrls: [],
  source: {
    account_type: AccountType.PERSONAL,
    account_id: 'accZ1IWjhjLv4',
  },
};

export const etxnObjWithAdvSourceData = {
  tx: {
    skip_reimbursement: true,
    source: 'MOBILE',
    txn_dt: new Date('2022-12-20T20:41:40.771Z'),
    currency: 'USD',
    amount: null,
    orig_currency: null,
    orig_amount: null,
    policy_amount: null,
    custom_properties: [],
    num_files: 0,
    org_user_id: 'ouvyOFOSx5bh',
  },
  dataUrls: [],
  source: {
    account_type: AccountType.ADVANCE,
    account_id: 'accYoo40xd0C1',
  },
};

export const orgSettingsData: OrgSettings = {
  org_id: 'orrb8EW1zZsy',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: false,
    unit: 'MILES',
    fiscal_year_start_date: '01-5',
    fiscal_year_end_date: '01-4',
    two_wheeler: 0.545,
    four_wheeler: 0.545,
    four_wheeler1: 0.7,
    four_wheeler3: 101,
    four_wheeler4: null,
    bicycle: 5,
    electric_car: null,
    two_wheeler_slabbed_rate: 0.4,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 32,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: 10,
    electric_car_slabbed_rate: null,
    two_wheeler_distance_limit: 10,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 33,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: 10,
    electric_car_distance_limit: null,
    enable_individual_mileage_rates: true,
  },
  advances: {
    allowed: true,
    enabled: true,
  },
  projects: {
    allowed: true,
    enabled: true,
  },
  advanced_projects: {
    allowed: true,
    enabled: true,
    enable_individual_projects: false,
  },
  advance_requests: {
    allowed: true,
    enabled: false,
  },
  cost_centers: {
    allowed: true,
    enabled: true,
  },
  policies: {
    allowed: true,
    enabled: true,
    self_serve_enabled: true,
    duplicate_detection_enabled: true,
    policyApprovalWorkflow: false,
  },
  org_creation: {
    allowed: true,
    enabled: true,
  },
  admin_allowed_ip_settings: {
    allowed: true,
    enabled: false,
    allowed_cidrs: [],
  },
  admin_email_settings: {
    allowed: true,
    enabled: true,
    unsubscribed_events: [],
  },
  org_personal_cards_settings: {
    allowed: true,
    enabled: true,
  },
  receipt_settings: {
    enabled: false,
    allowed: true,
    enable_magnifier: null,
  },
  corporate_credit_card_settings: {
    allowed: true,
    allow_approved_plus_states: true,
    enabled: true,
    auto_match_allowed: true,
    enable_auto_match: true,
    bank_data_aggregation_settings: {
      enabled: false,
      aggregator: null,
    },
    bank_statement_upload_settings: {
      enabled: true,
      generic_statement_parser_enabled: true,
      bank_statement_parser_endpoint_settings: [
        {
          bank_name: 'AMerican Express - Excel statement - LT',
          file_type: '.xls',
          parser_url: '/laguna_tools_amex_ccc',
        },
        {
          bank_name: 'American Express - Excel Statement - SP',
          file_type: '.xls',
          parser_url: '/structure_properties_amex_ccc',
        },
        {
          bank_name: 'Bank of America',
          file_type: '.pdf',
          parser_url: '/pipeline_solutions_bofa_ccc',
        },
      ],
    },
  },
  bank_data_aggregation_settings: {
    allowed: true,
    enabled: true,
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: 'afd',
    card_provider: 'asdf',
    number_of_cards: 3,
    status: 'IN_PROGRESS',
    last_updated_at: null,
    secret_key: 'bank-feed-request6iR9g13ks9',
  },
  ach_settings: {
    enabled: false,
    allowed: false,
    provider: 'dwolla',
    expedite_source: false,
    expedite_destination: false,
    pipeline_amount_limit: null,
  },
  per_diem: {
    allowed: true,
    enabled: true,
    enable_individual_per_diem_rates: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    payment_modes_order: [
      AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
      AllowedPaymentModes.PERSONAL_ACCOUNT,
      AllowedPaymentModes.COMPANY_ACCOUNT,
      AllowedPaymentModes.PERSONAL_ADVANCE_ACCOUNT,
    ],
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: null,
    groups: [
      {
        name: 'GST',
        percentage: 0.23,
      },
      {
        name: 'GST-free capital @0%',
        percentage: 0,
      },
      {
        name: 'GST-free non-capital @0%',
        percentage: 0,
      },
    ],
  },
  integrations_settings: {
    allowed: false,
    enabled: false,
    integrations: [],
  },
  taxi_settings: {
    allowed: true,
    distance_mandatory: false,
  },
  expense_limit_settings: {
    policy_ids: ['tprIXMh8y1WXN', 'tpr1iLLz3JkLT', 'tprxZJGW71PvH'],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: true,
    enable_secondary_approvers: false,
    enable_sequential_approvers: false,
  },
  accounting: {
    enabled: false,
    type: null,
    settings: null,
    integration_exports_enabled: false,
  },
  transaction_fields_settings: {
    allowed: true,
    enabled: true,
    transaction_mandatory_fields: {
      category: false,
      purpose: false,
      vendor: null,
      project: false,
      cost_center: null,
      flight_travel_class: null,
      train_travel_class: null,
      hotel_city: null,
      hotel_check_in: null,
      hotel_check_out: null,
    },
  },
  org_user_fields_settings: {
    allowed: true,
    enabled: true,
    org_user_mandatory_fields: null,
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: false,
    },
  },
  org_logo_settings: {
    allowed: true,
    enabled: true,
    file_id: 'fiZU3RFPLaFK',
  },
  org_branding_settings: {
    allowed: false,
    enabled: false,
  },
  verification: {
    allowed: true,
    mandatory: true,
    late_mode_enabled: null,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
  },
  advance_account_settings: {
    allowed: true,
    multiple_accounts: false,
  },
  settlements_excel_settings: {
    allowed: true,
    cost_center_wise_split: false,
  },
  bank_payment_file_settings: {
    allowed: true,
    enabled: true,
  },
  expense_settings: {
    allowed: false,
    split_expense_settings: {
      enabled: false,
    },
  },
  exchange_rate_settings: {
    allowed: true,
    enabled: true,
  },
  currencylayer_provider_settings: {
    allowed: true,
    enabled: true,
    id: 'CURRENCYLAYER',
    name: 'Currency Layer',
  },
  transaction_field_configurations: [],
  gmail_addon_settings: {
    allowed: false,
    enabled: false,
  },
  duplicate_detection_settings: {
    allowed: true,
    enabled: true,
  },
  custom_category_settings: {
    allowed: true,
    enabled: true,
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  auto_reminder_settings: {
    allowed: true,
    enabled: true,
  },
  analytics_settings: {
    allowed: true,
    enabled: true,
  },
  advanced_rbac_settings: {
    allowed: true,
    enabled: true,
  },
  sso_integration_settings: {
    allowed: false,
    enabled: false,
    idp_name: null,
    meta_data_file_id: null,
  },
  advanced_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  dynamic_form_settings: {
    allowed: true,
    enabled: true,
  },
  budget_settings: {
    allowed: true,
    enabled: true,
  },
  saved_filters_settings: {
    allowed: true,
    enabled: true,
  },
  org_currency_settings: {
    allowed: false,
    enabled: false,
  },
  recurrences_settings: {
    allowed: true,
    enabled: false,
  },
  mis_reporting_settings: {
    allowed: true,
    enabled: true,
  },
  risk_score_settings: {
    allowed: true,
    enabled: true,
  },
  workflow_settings: {
    allowed: true,
    enabled: true,
    report_workflow_settings: true,
  },
  card_assignment_settings: {
    allowed: true,
    enabled: true,
  },
  transaction_reversal_settings: {
    allowed: true,
    enabled: true,
  },
  auto_match_settings: {
    allowed: true,
    enabled: true,
  },
  universal_statement_parser_settings: {
    allowed: true,
    enabled: true,
  },
  in_app_chat_settings: {
    allowed: false,
    enabled: false,
  },
  ccc_draft_expense_settings: {
    allowed: true,
    enabled: true,
  },
  expense_widget_settings: {
    allowed: true,
    enabled: true,
  },
  org_expense_form_autofills: {
    allowed: true,
    enabled: true,
  },
  visa_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  mastercard_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  company_expenses_beta_settings: {
    allowed: true,
    enabled: true,
  },
  amex_feed_enrollment_settings: {
    allowed: true,
    enabled: true,
    virtual_card_settings_enabled: true,
  },
};

export const orgSettingsAdvDisabledData: OrgSettings = {
  org_id: 'orrb8EW1zZsy',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: false,
    unit: 'MILES',
    fiscal_year_start_date: '01-5',
    fiscal_year_end_date: '01-4',
    two_wheeler: 0.545,
    four_wheeler: 0.545,
    four_wheeler1: 0.7,
    four_wheeler3: 101,
    four_wheeler4: null,
    bicycle: 5,
    electric_car: null,
    two_wheeler_slabbed_rate: 0.4,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 32,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: 10,
    electric_car_slabbed_rate: null,
    two_wheeler_distance_limit: 10,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 33,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: 10,
    electric_car_distance_limit: null,
    enable_individual_mileage_rates: true,
  },
  advances: {
    allowed: true,
    enabled: false,
  },
  projects: {
    allowed: true,
    enabled: true,
  },
  advanced_projects: {
    allowed: true,
    enabled: true,
    enable_individual_projects: false,
  },
  advance_requests: {
    allowed: true,
    enabled: true,
  },
  cost_centers: {
    allowed: true,
    enabled: true,
  },
  policies: {
    allowed: true,
    enabled: true,
    self_serve_enabled: true,
    duplicate_detection_enabled: true,
    policyApprovalWorkflow: false,
  },
  org_creation: {
    allowed: true,
    enabled: true,
  },
  admin_allowed_ip_settings: {
    allowed: true,
    enabled: false,
    allowed_cidrs: [],
  },
  admin_email_settings: {
    allowed: true,
    enabled: true,
    unsubscribed_events: [],
  },
  org_personal_cards_settings: {
    allowed: true,
    enabled: true,
  },
  receipt_settings: {
    enabled: false,
    allowed: true,
    enable_magnifier: null,
  },
  corporate_credit_card_settings: {
    allowed: true,
    allow_approved_plus_states: true,
    enabled: true,
    auto_match_allowed: true,
    enable_auto_match: true,
    bank_data_aggregation_settings: {
      enabled: false,
      aggregator: null,
    },
    bank_statement_upload_settings: {
      enabled: true,
      generic_statement_parser_enabled: true,
      bank_statement_parser_endpoint_settings: [
        {
          bank_name: 'AMerican Express - Excel statement - LT',
          file_type: '.xls',
          parser_url: '/laguna_tools_amex_ccc',
        },
        {
          bank_name: 'American Express - Excel Statement - SP',
          file_type: '.xls',
          parser_url: '/structure_properties_amex_ccc',
        },
        {
          bank_name: 'Bank of America',
          file_type: '.pdf',
          parser_url: '/pipeline_solutions_bofa_ccc',
        },
      ],
    },
  },
  bank_data_aggregation_settings: {
    allowed: true,
    enabled: true,
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: 'afd',
    card_provider: 'asdf',
    number_of_cards: 3,
    status: 'IN_PROGRESS',
    last_updated_at: null,
    secret_key: 'bank-feed-request6iR9g13ks9',
  },
  ach_settings: {
    enabled: false,
    allowed: false,
    provider: 'dwolla',
    expedite_source: false,
    expedite_destination: false,
    pipeline_amount_limit: null,
  },
  per_diem: {
    allowed: true,
    enabled: true,
    enable_individual_per_diem_rates: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    payment_modes_order: [
      AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
      AllowedPaymentModes.PERSONAL_ACCOUNT,
      AllowedPaymentModes.COMPANY_ACCOUNT,
      AllowedPaymentModes.PERSONAL_ADVANCE_ACCOUNT,
    ],
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: null,
    groups: [
      {
        name: 'GST',
        percentage: 0.23,
      },
      {
        name: 'GST-free capital @0%',
        percentage: 0,
      },
      {
        name: 'GST-free non-capital @0%',
        percentage: 0,
      },
    ],
  },
  integrations_settings: {
    allowed: false,
    enabled: false,
    integrations: [],
  },
  taxi_settings: {
    allowed: true,
    distance_mandatory: false,
  },
  expense_limit_settings: {
    policy_ids: ['tprIXMh8y1WXN', 'tpr1iLLz3JkLT', 'tprxZJGW71PvH'],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: true,
    enable_secondary_approvers: false,
    enable_sequential_approvers: false,
  },
  accounting: {
    enabled: false,
    type: null,
    settings: null,
    integration_exports_enabled: false,
  },
  transaction_fields_settings: {
    allowed: true,
    enabled: true,
    transaction_mandatory_fields: {
      category: false,
      purpose: false,
      vendor: null,
      project: false,
      cost_center: null,
      flight_travel_class: null,
      train_travel_class: null,
      hotel_city: null,
      hotel_check_in: null,
      hotel_check_out: null,
    },
  },
  org_user_fields_settings: {
    allowed: true,
    enabled: true,
    org_user_mandatory_fields: null,
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: false,
    },
  },
  org_logo_settings: {
    allowed: true,
    enabled: true,
    file_id: 'fiZU3RFPLaFK',
  },
  org_branding_settings: {
    allowed: false,
    enabled: false,
  },
  verification: {
    allowed: true,
    mandatory: true,
    late_mode_enabled: null,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
  },
  advance_account_settings: {
    allowed: true,
    multiple_accounts: false,
  },
  settlements_excel_settings: {
    allowed: true,
    cost_center_wise_split: false,
  },
  bank_payment_file_settings: {
    allowed: true,
    enabled: true,
  },
  expense_settings: {
    allowed: false,
    split_expense_settings: {
      enabled: false,
    },
  },
  exchange_rate_settings: {
    allowed: true,
    enabled: true,
  },
  currencylayer_provider_settings: {
    allowed: true,
    enabled: true,
    id: 'CURRENCYLAYER',
    name: 'Currency Layer',
  },
  transaction_field_configurations: [],
  gmail_addon_settings: {
    allowed: false,
    enabled: false,
  },
  duplicate_detection_settings: {
    allowed: true,
    enabled: true,
  },
  custom_category_settings: {
    allowed: true,
    enabled: true,
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  auto_reminder_settings: {
    allowed: true,
    enabled: true,
  },
  analytics_settings: {
    allowed: true,
    enabled: true,
  },
  advanced_rbac_settings: {
    allowed: true,
    enabled: true,
  },
  sso_integration_settings: {
    allowed: false,
    enabled: false,
    idp_name: null,
    meta_data_file_id: null,
  },
  advanced_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  dynamic_form_settings: {
    allowed: true,
    enabled: true,
  },
  budget_settings: {
    allowed: true,
    enabled: true,
  },
  saved_filters_settings: {
    allowed: true,
    enabled: true,
  },
  org_currency_settings: {
    allowed: false,
    enabled: false,
  },
  recurrences_settings: {
    allowed: true,
    enabled: false,
  },
  mis_reporting_settings: {
    allowed: true,
    enabled: true,
  },
  risk_score_settings: {
    allowed: true,
    enabled: true,
  },
  workflow_settings: {
    allowed: true,
    enabled: true,
    report_workflow_settings: true,
  },
  card_assignment_settings: {
    allowed: true,
    enabled: true,
  },
  transaction_reversal_settings: {
    allowed: true,
    enabled: true,
  },
  auto_match_settings: {
    allowed: true,
    enabled: true,
  },
  universal_statement_parser_settings: {
    allowed: true,
    enabled: true,
  },
  in_app_chat_settings: {
    allowed: false,
    enabled: false,
  },
  ccc_draft_expense_settings: {
    allowed: true,
    enabled: true,
  },
  expense_widget_settings: {
    allowed: true,
    enabled: true,
  },
  org_expense_form_autofills: {
    allowed: true,
    enabled: true,
  },
  visa_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  mastercard_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  company_expenses_beta_settings: {
    allowed: true,
    enabled: true,
  },
  amex_feed_enrollment_settings: {
    allowed: true,
    enabled: true,
    virtual_card_settings_enabled: true,
  },
};

export const paymentModesResData = [
  {
    label: 'Corporate Card',
    value: {
      acc: {
        id: 'accYoo40xd0C1',
        created_at: new Date('2018-08-05T08:32:51.583Z'),
        updated_at: new Date('2022-12-23T08:34:46.658Z'),
        name: 'Corporate Credit Card Account',
        type: AccountType.CCC,
        currency: 'USD',
        target_balance_amount: 0,
        current_balance_amount: 107069.2181,
        tentative_balance_amount: -379832.039763,
        category: null,
        displayName: 'Corporate Card',
        isReimbursable: false,
      },
      ou: {
        id: 'ouvyOFOSx5bh',
        org_id: 'orrb8EW1zZsy',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: null,
        number: null,
        id: null,
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: null,
      amount: null,
    },
  },
  {
    label: 'Personal Card/Cash',
    value: {
      acc: {
        id: 'accWUsrRlinFb',
        created_at: new Date('2018-08-05T06:02:11.742Z'),
        updated_at: new Date('2022-12-23T08:32:19.246Z'),
        name: 'Personal Account',
        type: AccountType.PERSONAL,
        currency: 'USD',
        target_balance_amount: 0,
        current_balance_amount: 0,
        tentative_balance_amount: 159640.246645,
        category: null,
        displayName: 'Personal Card/Cash',
        isReimbursable: true,
      },
      ou: {
        id: 'ouvyOFOSx5bh',
        org_id: 'orrb8EW1zZsy',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: null,
        number: null,
        id: null,
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: null,
      amount: null,
    },
  },
  {
    label: 'Paid by Company',
    value: {
      acc: {
        id: 'accWUsrRlinFb',
        created_at: new Date('2018-08-05T06:02:11.742Z'),
        updated_at: new Date('2022-12-23T08:32:19.246Z'),
        name: 'Personal Account',
        type: AccountType.PERSONAL,
        currency: 'USD',
        target_balance_amount: 0,
        current_balance_amount: 0,
        tentative_balance_amount: 159640.246645,
        category: null,
        displayName: 'Paid by Company',
        isReimbursable: false,
      },
      ou: {
        id: 'ouvyOFOSx5bh',
        org_id: 'orrb8EW1zZsy',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: null,
        number: null,
        id: null,
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: null,
      amount: null,
    },
  },
  {
    label: 'Advance (Balance: $223,146,386.93)',
    value: {
      acc: {
        id: 'acc6mK6CEesGL',
        created_at: new Date('2018-11-15T06:25:00.402Z'),
        updated_at: new Date('2022-09-14T09:20:46.442Z'),
        name: 'Advance Account',
        type: AccountType.ADVANCE,
        currency: 'USD',
        target_balance_amount: 0,
        current_balance_amount: 223146436,
        tentative_balance_amount: 223146386.93,
        category: null,
        displayName: 'Advance (Balance: $223,146,386.93)',
        isReimbursable: false,
      },
      ou: {
        id: 'ouvyOFOSx5bh',
        org_id: 'orrb8EW1zZsy',
      },
      us: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
      },
      org: {
        id: null,
        domain: null,
      },
      advance: {
        purpose: 'erertert',
        number: 'A/2022/03/T/4',
        id: 'adve6o3JdrDbI',
      },
      orig: {
        currency: null,
        amount: null,
      },
      currency: 'USD',
      amount: 23213,
    },
  },
];

export const paymentModesAccountsData = [
  {
    acc: {
      id: 'accWUsrRlinFb',
      created_at: new Date('2018-08-05T06:02:11.742Z'),
      updated_at: new Date('2022-12-23T08:32:19.246Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: 159640.246645,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accYoo40xd0C1',
      created_at: new Date('2018-08-05T08:32:51.583Z'),
      updated_at: new Date('2022-12-23T08:34:46.658Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 107069.2181,
      tentative_balance_amount: -379832.039763,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'acc6mK6CEesGL',
      created_at: new Date('2018-11-15T06:25:00.402Z'),
      updated_at: new Date('2022-09-14T09:20:46.442Z'),
      name: 'Advance Account',
      type: AccountType.ADVANCE,
      currency: 'USD',
      target_balance_amount: 0,
      current_balance_amount: 223146436,
      tentative_balance_amount: 223146386.93,
      category: null,
    },
    ou: {
      id: 'ouvyOFOSx5bh',
      org_id: 'orrb8EW1zZsy',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: 'erertert',
      number: 'A/2022/03/T/4',
      id: 'adve6o3JdrDbI',
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: 'USD',
    amount: 23213,
  },
];

export const accountsData: ExtendedAccount[] = [
  {
    acc: {
      id: 'acc5APeygFjRd',
      created_at: new Date('2018-02-01T02:32:25.248Z'),
      updated_at: new Date('2023-02-01T12:27:31.475Z'),
      name: 'Personal Account',
      type: AccountType.PERSONAL,
      currency: 'INR',
      target_balance_amount: 0,
      current_balance_amount: 0,
      tentative_balance_amount: -28739316400117.543,
      category: null,
    },
    ou: {
      id: 'ouX8dwsbLCLv',
      org_id: 'orNVthTo2Zyo',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accZ1IWjhjLv4',
      created_at: new Date('2019-01-11T16:41:56.485Z'),
      updated_at: new Date('2023-01-30T11:24:15.585Z'),
      name: 'Corporate Credit Card Account',
      type: AccountType.CCC,
      currency: 'INR',
      target_balance_amount: 0,
      current_balance_amount: 158914.16,
      tentative_balance_amount: -24134830648.688267,
      category: null,
    },
    ou: {
      id: 'ouX8dwsbLCLv',
      org_id: 'orNVthTo2Zyo',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: null,
      number: null,
      id: null,
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: null,
    amount: null,
  },
  {
    acc: {
      id: 'accmnYUHUiJw2',
      created_at: new Date('2022-04-25T06:42:22.414Z'),
      updated_at: new Date('2022-06-03T07:55:14.171Z'),
      name: 'Advance Account',
      type: AccountType.ADVANCE,
      currency: 'INR',
      target_balance_amount: 0,
      current_balance_amount: 499,
      tentative_balance_amount: 499,
      category: null,
    },
    ou: {
      id: 'ouX8dwsbLCLv',
      org_id: 'orNVthTo2Zyo',
    },
    us: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
    },
    org: {
      id: null,
      domain: null,
    },
    advance: {
      purpose: 'test',
      number: 'A/2022/04/T/1',
      id: 'adv7pbzHwP5ci',
    },
    orig: {
      currency: null,
      amount: null,
    },
    currency: 'INR',
    amount: 499,
  },
];

export const orgSettingsDataWithoutAdvPro = {
  ...orgSettingsData,
  advanced_projects: {
    allowed: true,
    enabled: true,
    enable_individual_projects: true,
  },
};

export const orgSettingsWithoutAutofill: OrgSettings = {
  ...orgSettingsData,
  org_expense_form_autofills: {
    allowed: false,
    enabled: false,
  },
};

export const paymentModesConfig = {
  etxn: unflattenedTxn,
  orgSettings: {
    ...orgSettingsData,
    corporate_credit_card_settings: {
      ...orgSettingsData.corporate_credit_card_settings,
      allowed: false,
      enabled: false,
    },
  },
  expenseType: ExpenseType.MILEAGE,
  isPaymentModeConfigurationsEnabled: true,
};
