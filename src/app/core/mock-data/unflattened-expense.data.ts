import { ExpenseSource } from '../models/expense-source.enum';
import { ExpenseState } from '../models/expense-state.enum';
import { PublicPolicyExpense } from '../models/public-policy-expense.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';

export const unflattenExp1: { tx: PublicPolicyExpense } = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txSEM4DtjyKR',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-03-06T07:51:36.297Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2023-03-06T06:30:00.000Z'),
    category: null,
    amount: 12257.475149999998,
    user_amount: 12257.475149999998,
    policy_amount: null,
    admin_amount: null,
    tax: '1869.786',
    tax_amount: 1869.786,
    tax_group_id: 'tg3iWuqWhfzB',
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'DRAFT',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term (1)',
    source: 'MOBILE_CAMERA',
    billable: null,
    orig_amount: 150,
    orig_currency: 'USD',
    project_id: 3744,
    project_name: '3234',
    project_code: 'CPM usr 1 test',
    skip_reimbursement: true,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: '14',
    cost_center_code: '12',
    cost_center_id: 13793,
    source_account_id: 'acc5APeygFjRd',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: false,
    vendor: 'Nilesh As Vendor',
    vendor_id: 28923,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: '00',
    sub_category: '00',
    fyle_category: 'Entertainment',
    org_category_code: null,
    org_category_id: 110351,
    expense_number: 'E/2023/03/T/115',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx1vdITUXIzf',
    split_group_user_amount: 20429.125249999997,
    extracted_data: {
      amount: 90.9,
      currency: 'INR',
      category: 'Office Supplies',
      date: null,
      vendor: null,
      invoice_dt: null,
    },
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
    custom_properties: [
      {
        name: 'userlist',
        value: [],
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: '00',
    exchange_rate: 0,
    exchange_rate_diff_percentage: 0,
    is_matching_ccc_expense: false,
    mileage_rate_id: 0,
    payment_id: '',
    proposed_exchange_rate: 0,
    status_id: '',
    updated_at: undefined,
  },
};

export const unflattenExp2: { tx: PublicPolicyExpense } = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txNyI8ot5CuJ',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-03-06T07:51:36.304Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2023-03-06T06:30:00.000Z'),
    category: null,
    amount: 8171.650099999999,
    user_amount: 8171.650099999999,
    policy_amount: null,
    admin_amount: null,
    tax: '1246.524',
    tax_amount: 1246.524,
    tax_group_id: 'tg3iWuqWhfzB',
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'DRAFT',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term (2)',
    source: 'MOBILE_CAMERA',
    billable: null,
    orig_amount: 100,
    orig_currency: 'USD',
    project_id: 3744,
    project_name: '3234',
    project_code: 'CPM usr 1 test',
    skip_reimbursement: true,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: '14',
    cost_center_code: '12',
    cost_center_id: 13793,
    source_account_id: 'acc5APeygFjRd',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: false,
    vendor: 'Nilesh As Vendor',
    vendor_id: 28923,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: '00',
    sub_category: '00',
    fyle_category: 'Entertainment',
    org_category_code: null,
    org_category_id: 110351,
    expense_number: 'E/2023/03/T/116',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx1vdITUXIzf',
    split_group_user_amount: 20429.125249999997,
    extracted_data: {
      amount: 90.9,
      currency: 'INR',
      category: 'Office Supplies',
      date: null,
      vendor: null,
      invoice_dt: null,
    },
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
    custom_properties: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: '00',
    exchange_rate: 0,
    exchange_rate_diff_percentage: 0,
    is_matching_ccc_expense: false,
    mileage_rate_id: 0,
    payment_id: '',
    proposed_exchange_rate: 0,
    status_id: '',
    updated_at: undefined,
  },
};

export const unflattenedTxn: UnflattenedTransaction = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txSEM4DtjyKR',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-03-06T07:51:36.297Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2023-03-06T06:30:00.000Z'),
    category: null,
    amount: 12257.475149999998,
    user_amount: 12257.475149999998,
    policy_amount: null,
    admin_amount: null,
    tax: 1869.786,
    tax_amount: 1869.786,
    tax_group_id: 'tg3iWuqWhfzB',
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'DRAFT',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term (1)',
    source: 'MOBILE_CAMERA',
    billable: null,
    orig_amount: 150,
    orig_currency: 'USD',
    project_id: 3744,
    project_name: '3234',
    project_code: 'CPM usr 1 test',
    skip_reimbursement: true,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: '14',
    cost_center_code: '12',
    cost_center_id: 13793,
    source_account_id: 'acc5APeygFjRd',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: false,
    vendor: 'Nilesh As Vendor',
    vendor_id: 28923,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: '00',
    sub_category: '00',
    fyle_category: 'Entertainment',
    org_category_code: null,
    org_category_id: 110351,
    expense_number: 'E/2023/03/T/115',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx1vdITUXIzf',
    split_group_user_amount: 20429.125249999997,
    extracted_data: {
      amount: 90.9,
      currency: 'INR',
      category: 'Office Supplies',
      date: null,
      vendor: null,
      invoice_dt: null,
    },
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
    custom_properties: [
      {
        name: 'userlist',
        value: [],
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: '00',
    exchange_rate: 0,
    exchange_rate_diff_percentage: 0,
    is_matching_ccc_expense: false,
    mileage_rate_id: 0,
    payment_id: '',
    proposed_exchange_rate: 0,
    status_id: '',
    updated_at: undefined,
  },
  ou: undefined,
  us: undefined,
  source: {
    account_type: '',
    account_id: '',
  },
  tg: {
    name: '',
    percentage: 0,
  },
  rp: undefined,
  external: {
    expense_id: '',
  },
  is: {
    test_call: false,
  },
};

export const unflattenedExpData = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txbO4Xaj4N53',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-05-30T02:18:27.646Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2023-05-30T01:00:00.000Z'),
    category: null,
    amount: 780,
    user_amount: 780,
    policy_amount: null,
    admin_amount: null,
    tax: 64.4,
    tax_amount: 64.4,
    tax_group_id: 'tgzhpXlC40LK',
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term',
    source: 'WEBAPP',
    billable: null,
    orig_amount: null,
    orig_currency: null,
    project_id: null,
    project_name: null,
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
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
    policy_flag: true,
    vendor: 'YEHUDAHALEVI16',
    vendor_id: 22658,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'ani test',
    sub_category: 'ani test',
    fyle_category: null,
    org_category_code: null,
    org_category_id: 212690,
    expense_number: 'E/2023/05/T/326',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'txbO4Xaj4N53',
    split_group_user_amount: 780,
    extracted_data: {
      amount: null,
      currency: 'INR',
      category: 'Food',
      date: null,
      vendor: null,
      invoice_dt: null,
    },
    transcribed_data: null,
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
    hotel_is_breakfast_provided: false,
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
        name: 'test',
        value: '',
      },
      {
        name: 'User List',
        value: [],
      },
      {
        name: 'select all 2',
        value: null,
      },
      {
        name: 'test 112',
        value: null,
      },
      {
        name: 'category2',
        value: '',
      },
      {
        name: 'boolean',
        value: false,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'ani test',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: '123',
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'dept7HJ9C4wvtX',
    department: '0000000',
    title: 'director',
    mobile: '+919764989821',
    sub_department: 'arun',
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  },
  tg: {
    name: 'Tax on Goods @8.75%',
    percentage: 0.09,
  },
  rp: {
    purpose: null,
    approved_at: null,
    reimbursed_at: null,
    claim_number: null,
  },
  us: {
    full_name: 'Abhishek Jain',
    email: 'ajain@fyle.in',
  },
  source: {
    account_type: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
    account_id: 'accZ1IWjhjLv4',
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
  dataUrls: [],
};

export const draftUnflattendedTxn = {
  ...unflattenedExpData,
  tx: {
    ...unflattenedExpData.tx,
    id: null,
    source: 'MOBILE',
    state: 'DRAFT',
    org_category_id: null,
    fyle_category: 'UNSPECIFIED',
  },
};

export const draftUnflattendedTxn2: UnflattenedTransaction = {
  ...unflattenedExpData,
  tx: {
    ...unflattenedExpData.tx,
    id: null,
    source: 'MOBILE',
    state: 'DRAFT',
    org_category_id: null,
    fyle_category: null,
  },
};

export const draftUnflattendedTxn3 = {
  ...unflattenedExpData,
  tx: {
    ...unflattenedExpData.tx,
    id: 'txCYDX0peUw5',
    source: 'WEBAPP_BULK',
    state: 'DRAFT',
    org_category_id: null,
    fyle_category: 'UNSPECIFIED',
  },
};

export const draftUnflattendedTxn4: UnflattenedTransaction = {
  ...unflattenedExpData,
  tx: {
    ...unflattenedExpData.tx,
    id: null,
    source: 'MOBILE',
    state: 'DRAFT',
    org_category_id: 212690,
    fyle_category: null,
  },
};

export const unflattenedTxnDataPerDiem = {
  tx: {
    // TODO: Enum for state and source
    skip_reimbursement: false,
    source: ExpenseSource.MOBILE,
    org_category_id: 38912,
    org_category: 'Per Diem',
    sub_category: 'Per Diem',
    amount: 0,
    currency: 'USD',
    state: ExpenseState.COMPLETE,
    txn_dt: new Date(),
    from_dt: null,
    to_dt: null,
    per_diem_rate_id: null,
    num_days: null,
    policy_amount: null,
    custom_properties: [],
    org_user_id: 'ouX8dwsbLCLv',
  },
};
