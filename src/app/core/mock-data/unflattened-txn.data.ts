import { UnflattenedTransaction } from '../models/unflattened-transaction.model';

export const unflattenedTxnData: UnflattenedTransaction = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'tx3qHxFNgRcZ',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-01-24T04:24:24.186Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2023-01-24T11:30:00.000Z'),
    category: null,
    amount: 344,
    user_amount: 344,
    policy_amount: null,
    admin_amount: null,
    tax: 52.47,
    tax_amount: 52.47,
    tax_group_id: 'tg3iWuqWhfzB',
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term',
    source: 'MOBILE_DASHCAM_SINGLE',
    billable: null,
    orig_amount: null,
    orig_currency: null,
    project_id: 316443,
    project_name: 'Project 1 / asdfg',
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: '01test2',
    cost_center_code: null,
    cost_center_id: 13795,
    source_account_id: 'acc5APeygFjRd',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: null,
    vendor: 'Australian Taxation Office',
    vendor_id: 28860,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'Software',
    sub_category: 'Software',
    fyle_category: null,
    org_category_code: '117',
    org_category_id: 16577,
    expense_number: 'E/2023/01/T/99',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx3qHxFNgRcZ',
    split_group_user_amount: 344,
    extracted_data: {
      amount: null,
      currency: 'INR',
      category: 'Software',
      date: null,
      vendor: null,
      invoice_dt: null,
    },
    transcribed_data: null,
    user_review_needed: true,
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
        value: null,
      },
      {
        name: 'User List',
        value: null,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Software',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title: 'director',
    mobile: '123456',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  },
  tg: {
    name: 'cgst',
    percentage: 0.18,
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
    account_type: 'PERSONAL_ACCOUNT',
    account_id: 'acc5APeygFjRd',
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
};

export const unflattenedTxnDataWithSubCategory: UnflattenedTransaction = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'tx3qHxFNgRcZ',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-01-24T04:24:24.186Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: new Date('2023-01-24T11:30:00.000Z'),
    category: null,
    amount: 344,
    user_amount: 344,
    policy_amount: null,
    admin_amount: null,
    tax: 52.47,
    tax_amount: 52.47,
    tax_group_id: 'tg3iWuqWhfzB',
    currency: 'INR',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term',
    source: 'MOBILE_DASHCAM_SINGLE',
    billable: null,
    orig_amount: null,
    orig_currency: null,
    project_id: 316443,
    project_name: 'Project 1 / asdfg',
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: '01test2',
    cost_center_code: null,
    cost_center_id: 13795,
    source_account_id: 'acc5APeygFjRd',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: null,
    vendor: 'Australian Taxation Office',
    vendor_id: 28860,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'Software',
    sub_category: 'Subscriptions',
    fyle_category: null,
    org_category_code: '117',
    org_category_id: 16577,
    expense_number: 'E/2023/01/T/99',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx3qHxFNgRcZ',
    split_group_user_amount: 344,
    extracted_data: {
      amount: null,
      currency: 'INR',
      category: 'Software',
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
        value: null,
      },
      {
        name: 'User List',
        value: null,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Software / Subscriptions',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title: 'director',
    mobile: '123456',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  },
  tg: {
    name: 'cgst',
    percentage: 0.18,
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
    account_type: 'PERSONAL_ACCOUNT',
    account_id: 'acc5APeygFjRd',
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
};

export const unflattenedTxnWithExtractedData: UnflattenedTransaction = {
  ...unflattenedTxnData,
  tx: {
    ...unflattenedTxnData.tx,
    source: 'MOBILE',
    state: 'DRAFT',
    amount: undefined,
    currency: undefined,
    vendor: undefined,
    fyle_category: 'UNSPECIFIED',
    extracted_data: {
      amount: 100,
      currency: 'USD',
      date: new Date('2022-11-30T06:30:00.000Z'),
      category: 'TRAVEL',
      vendor: 'vendor',
      invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
    },
  },
};

export const expectedUnflattendedTxnData1: UnflattenedTransaction = {
  tx: {
    risk_state: null,
    txn_dt: new Date('2023-01-24T11:30:00.000Z'),
    is_duplicate_expense: null,
    duplicates: null,
    id: 'tx3qHxFNgRcZ',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-01-24T04:24:24.186Z'),
    receipt_required: false,
    user_can_delete: true,
    category: null,
    amount: 100,
    user_amount: 344,
    policy_amount: null,
    admin_amount: null,
    tax: 52.47,
    tax_amount: 52.47,
    tax_group_id: 'tg3iWuqWhfzB',
    currency: 'USD',
    report_id: null,
    reported_at: null,
    state: 'DRAFT',
    num_files: 1,
    invoice_number: null,
    purpose: 'test_term',
    source: 'MOBILE',
    billable: null,
    orig_amount: null,
    orig_currency: null,
    project_id: 316443,
    project_name: 'Project 1 / asdfg',
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: '01test2',
    cost_center_code: null,
    cost_center_id: 13795,
    source_account_id: 'acc5APeygFjRd',
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: null,
    vendor: 'vendor',
    vendor_id: 28860,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'Software',
    sub_category: 'Software',
    fyle_category: 'UNSPECIFIED',
    org_category_code: '117',
    org_category_id: 16566,
    expense_number: 'E/2023/01/T/99',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx3qHxFNgRcZ',
    split_group_user_amount: 344,
    extracted_data: {
      amount: 100,
      currency: 'USD',
      date: new Date('2022-11-30T06:30:00.000Z'),
      category: 'TRAVEL',
      vendor: 'vendor',
      invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
    },
    transcribed_data: null,
    user_review_needed: true,
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
        value: null,
      },
      {
        name: 'User List',
        value: null,
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Software',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title: 'director',
    mobile: '123456',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000Z'),
  },
  tg: {
    name: 'cgst',
    percentage: 0.18,
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
    account_type: 'PERSONAL_ACCOUNT',
    account_id: 'acc5APeygFjRd',
  },
  external: {
    expense_id: null,
  },
  is: {
    test_call: null,
  },
};

export const expectedUnflattendedTxnData2 = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'txbO4Xaj4N53',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-05-30T02:18:27.646Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: null,
    category: null,
    amount: 500,
    user_amount: 780,
    policy_amount: null,
    admin_amount: null,
    tax: 64.4,
    tax_amount: null,
    currency: 'USD',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 0,
    invoice_number: null,
    purpose: null,
    source: 'MOBILE',
    billable: null,
    project_name: null,
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: 'SMS1',
    cost_center_code: null,
    cost_center_id: 2411,
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: true,
    vendor_id: 22658,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'ani test',
    sub_category: 'ani test',
    org_category_code: null,
    expense_number: 'E/2023/05/T/326',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'txbO4Xaj4N53',
    split_group_user_amount: 780,
    extracted_data: {
      category: 'SYSTEM',
      currency: 'USD',
      amount: 100,
      date: new Date('2023-02-15T06:30:00.000Z'),
      invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
      vendor_name: 'vendor',
    },
    tax_group_id: undefined,
    orig_amount: undefined,
    orig_currency: undefined,
    project_id: undefined,
    source_account_id: undefined,
    vendor: undefined,
    fyle_category: undefined,
    org_category_id: undefined,
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
    hotel_is_breakfast_provided: null,
    flight_journey_travel_class: null,
    flight_return_travel_class: null,
    train_travel_class: null,
    bus_travel_class: null,
    taxi_travel_class: null,
    per_diem_rate_id: null,
    activity_policy_pending: null,
    activity_details: null,
    locations: ['loc1', 'loc2'],
    custom_properties: [
      { id: 111, name: 'Test Number', value: 121, type: 'NUMBER' },
      { id: 150, name: 'checking', value: false, type: 'BOOLEAN' },
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
    joining_dt: new Date('2017-07-25T00:00:00.000Z'),
  },
  dataUrls: [],
};

export const unflattenedTxnData2: UnflattenedTransaction = {
  ...unflattenedTxnData,
  tx: {
    ...unflattenedTxnData.tx,
    amount: 100,
    user_amount: 100,
  },
};

export const expectedUnflattendedTxnData3 = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: 'tx3qHxFNgRcZ',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-01-24T04:24:24.186Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: null,
    category: null,
    amount: 100,
    user_amount: 100,
    policy_amount: null,
    admin_amount: null,
    tax: 52.47,
    tax_amount: null,
    currency: 'USD',
    report_id: null,
    reported_at: null,
    state: 'COMPLETE',
    num_files: 1,
    invoice_number: null,
    purpose: null,
    source: 'MOBILE',
    billable: null,
    project_name: 'Project 1 / asdfg',
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: 'SMS1',
    cost_center_code: null,
    cost_center_id: 2411,
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: null,
    vendor_id: 28860,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'TRAVEL',
    sub_category: 'TAXI',
    org_category_code: '117',
    expense_number: 'E/2023/01/T/99',
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'tx3qHxFNgRcZ',
    split_group_user_amount: 344,
    extracted_data: {
      amount: null,
      currency: 'INR',
      category: 'Software',
      date: null,
      vendor: null,
      invoice_dt: null,
    },
    transcribed_data: null,
    user_review_needed: true,
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
    tax_group_id: undefined,
    orig_amount: undefined,
    orig_currency: undefined,
    project_id: undefined,
    source_account_id: undefined,
    vendor: undefined,
    fyle_category: undefined,
    org_category_id: undefined,
    activity_policy_pending: null,
    activity_details: null,
    locations: ['loc1'],
    custom_properties: [
      {
        id: 111,
        name: 'Test Number',
        value: 121,
        type: 'NUMBER',
      },
      {
        id: 115,
        name: 'test date',
        value: new Date('2017-07-25T00:00:00.000Z'),
        type: 'DATE',
      },
      {
        id: 150,
        name: 'checking',
        value: false,
        type: 'BOOLEAN',
      },
      {
        id: 151,
        name: 'Select field',
        value: 'select-1',
        type: 'SELECT',
      },
    ],
    is_implicit_merge_blocked: false,
    categoryDisplayName: 'Software',
  },
  ou: {
    org_name: 'Staging Loaded',
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    title: 'director',
    mobile: '123456',
    sub_department: null,
    joining_dt: new Date('2017-07-25T00:00:00.000Z'),
  },
  dataUrls: [],
};

export const expectedUnflattendedTxnData4 = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: null,
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-05-30T02:18:27.646Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: null,
    category: null,
    amount: 100,
    user_amount: 780,
    policy_amount: null,
    admin_amount: null,
    tax: 64.4,
    tax_amount: null,
    currency: 'USD',
    report_id: null,
    reported_at: null,
    state: 'DRAFT',
    num_files: 0,
    invoice_number: null,
    purpose: null,
    source: 'MOBILE',
    billable: null,
    project_name: null,
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: 'SMS1',
    cost_center_code: null,
    cost_center_id: 2411,
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: true,
    vendor_id: 22658,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'ani test',
    sub_category: 'ani test',
    org_category_code: null,
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
    hotel_is_breakfast_provided: null,
    flight_journey_travel_class: null,
    flight_return_travel_class: null,
    train_travel_class: null,
    bus_travel_class: null,
    taxi_travel_class: null,
    per_diem_rate_id: null,
    activity_policy_pending: null,
    activity_details: null,
    tax_group_id: undefined,
    orig_amount: undefined,
    orig_currency: undefined,
    project_id: undefined,
    source_account_id: undefined,
    vendor: undefined,
    fyle_category: undefined,
    org_category_id: undefined,
    locations: [],
    custom_properties: [
      {
        id: 111,
        name: 'Test Number',
        value: 121,
        type: 'NUMBER',
      },
      {
        id: 115,
        name: 'test date',
        type: 'DATE',
        value: undefined,
      },
      {
        id: 150,
        name: 'checking',
        value: false,
        type: 'BOOLEAN',
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
    joining_dt: new Date('2017-07-25T00:00:00.000Z'),
  },
  dataUrls: [
    {
      id: 'fiHPZUiichAS',
      org_user_id: 'ouX8dwsbLCLv',
      created_at: new Date('2023-02-01T12:27:28.522Z'),
      name: '000.jpeg',
      s3url: '2023-02-01/orNVthTo2Zyo/receipts/fiHPZUiichAS.000.jpeg',
      transaction_id: 'txdzGV1TZEg3',
      invoice_id: null,
      advance_request_id: null,
      purpose: 'ORIGINAL',
      password: null,
      receipt_coordinates: null,
      email_meta_data: null,
      fyle_sub_url: '/api/files/fiHPZUiichAS/download',
    },
  ],
};

export const expectedUnflattendedTxnData5 = {
  tx: {
    risk_state: null,
    is_duplicate_expense: null,
    duplicates: null,
    id: null,
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-05-30T02:18:27.646Z'),
    receipt_required: false,
    user_can_delete: true,
    txn_dt: null,
    category: null,
    amount: 100,
    user_amount: 780,
    policy_amount: null,
    admin_amount: null,
    tax: 64.4,
    tax_amount: null,
    currency: 'USD',
    report_id: null,
    reported_at: null,
    state: 'DRAFT',
    num_files: 0,
    invoice_number: null,
    purpose: null,
    source: 'MOBILE',
    billable: null,
    project_name: null,
    project_code: null,
    skip_reimbursement: false,
    creator_id: 'ouX8dwsbLCLv',
    user_reason_for_duplicate_expenses: null,
    external_id: null,
    cost_center_name: null,
    cost_center_code: null,
    cost_center_id: null,
    tax_group_id: undefined,
    orig_amount: undefined,
    orig_currency: undefined,
    project_id: undefined,
    source_account_id: undefined,
    vendor: undefined,
    fyle_category: undefined,
    org_category_id: undefined,
    transcription_state: null,
    verification_state: null,
    physical_bill: null,
    physical_bill_at: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: true,
    vendor_id: 22658,
    platform_vendor: null,
    platform_vendor_id: null,
    org_category: 'ani test',
    sub_category: 'ani test',
    org_category_code: null,
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
        id: 111,
        name: 'Test Number',
        value: 121,
        type: 'NUMBER',
      },
      {
        id: 115,
        name: 'test date',
        type: 'DATE',
        value: undefined,
      },
      {
        id: 150,
        name: 'checking',
        value: false,
        type: 'BOOLEAN',
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
    joining_dt: new Date('2017-07-25T00:00:00.000Z'),
  },
  dataUrls: [],
};

export const unflattenedTxnDataWithoutCategoryData: UnflattenedTransaction = {
  ...unflattenedTxnData,
  tx: {
    ...unflattenedTxnData.tx,
    extracted_data: null,
    org_category_id: null,
    fyle_category: 'unspecified',
  },
};
