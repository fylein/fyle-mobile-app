import { TransactionStatus } from '../models/platform/v1/expense.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';

export const transformedExpenseData: Partial<UnflattenedTransaction> = {
  tx: {
    id: 'txvslh8aQMbu',
    created_at: new Date('2023-12-05T17:20:43.158Z'),
    txn_dt: new Date('2023-12-06T06:00:00.000Z'),
    categoryDisplayName: 'Mileage',
    num_files: 0,
    org_category: 'Mileage',
    fyle_category: 'Mileage',
    state: 'DRAFT',
    admin_amount: null,
    policy_amount: null,
    skip_reimbursement: false,
    amount: 2263.68,
    currency: 'USD',
    user_amount: 2263.68,
    orig_amount: null,
    orig_currency: null,
    from_dt: null,
    to_dt: null,
    vendor: null,
    distance: 3456,
    distance_unit: 'MILES',
    locations: [],
    verification_state: null,
    org_user_id: 'ou6cE4dCLH8d',
    expense_number: 'E/2023/12/T/8',
    hotel_is_breakfast_provided: null,
    tax_group_id: null,
    creator_id: 'ou6cE4dCLH8d',
    report_id: null,
    org_category_id: 256620,
    cost_center_id: null,
    project_id: null,
    custom_properties: [
      {
        name: 'ASDF',
        type: 'TEXT',
        value: null,
      },
    ],
    purpose: null,
    billable: null,
    sub_category: null,
    tax_amount: null,
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'txvslh8aQMbu',
    split_group_user_amount: null,
    receipt_required: null,
    per_diem_rate_id: null,
    num_days: null,
    mileage_rate_id: 332872,
    mileage_rate: 0.655,
    mileage_vehicle_type: 'IRS Rate',
    mileage_is_round_trip: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    manual_flag: null,
    policy_flag: false,
    extracted_data: null,
    matched_corporate_card_transactions: [],
    source_account_id: 'accO6abI7gZ6T',
    org_category_code: null,
    physical_bill: null,
    physical_bill_at: null,
  },
  source: {
    account_id: 'accO6abI7gZ6T',
    account_type: 'PERSONAL_CASH_ACCOUNT',
  },
  ou: {
    id: 'ou6cE4dCLH8d',
    org_id: 'orNbIQloYtfa',
  },
};

export const transformedExpenseDataWithSubCategory: Partial<UnflattenedTransaction> = {
  tx: {
    id: 'txD5hIQgLuR5',
    created_at: new Date('2024-02-09T01:20:13.098Z'),
    txn_dt: new Date('2024-02-09T06:00:00.000Z'),
    categoryDisplayName: 'Food / Burger',
    num_files: 0,
    org_category: 'Food',
    fyle_category: 'Food',
    state: 'APPROVER_PENDING',
    admin_amount: null,
    policy_amount: null,
    skip_reimbursement: false,
    amount: 32,
    currency: 'USD',
    user_amount: 32,
    orig_amount: null,
    orig_currency: null,
    from_dt: null,
    to_dt: null,
    vendor: 'test-1',
    distance: null,
    distance_unit: null,
    locations: [],
    verification_state: null,
    org_user_id: 'ou6cE4dCLH8d',
    expense_number: 'E/2024/02/T/137',
    hotel_is_breakfast_provided: null,
    tax_group_id: 'tgyvHlipn1sF',
    creator_id: 'ou6cE4dCLH8d',
    report_id: null,
    org_category_id: 290006,
    cost_center_id: 20423,
    cost_center_name: 'Cost Center',
    cost_center_code: null,
    project_id: 325126,
    project_name: 'Project 1',
    custom_properties: [
      {
        is_enabled: true,
        name: 'location desc',
        type: 'TEXT',
        value: 'Noida',
      },
      {
        is_enabled: true,
        name: 'PP1 where',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'PP 1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'CC 1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
    ],
    purpose: 'Client Meeting',
    billable: null,
    sub_category: 'Burger',
    tax_amount: 3.43,
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'txD5hIQgLuR5',
    split_group_user_amount: null,
    receipt_required: null,
    per_diem_rate_id: null,
    num_days: null,
    mileage_rate_id: null,
    mileage_is_round_trip: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    manual_flag: null,
    policy_flag: null,
    extracted_data: null,
    matched_corporate_card_transactions: [],
    source_account_id: 'accO6abI7gZ6T',
    org_category_code: null,
    project_code: null,
    physical_bill: null,
    physical_bill_at: null,
  },
  source: {
    account_id: 'accO6abI7gZ6T',
    account_type: 'PERSONAL_CASH_ACCOUNT',
  },
  ou: {
    id: 'ou6cE4dCLH8d',
    org_id: 'orNbIQloYtfa',
  },
};

export const transformedExpenseDataWithReportId: Partial<UnflattenedTransaction> = {
  ...transformedExpenseDataWithSubCategory,
  tx: {
    ...transformedExpenseDataWithSubCategory.tx,
    report_id: 'rpbNc3kn5baq',
  },
};

export const transformedExpenseDataWithReportId2: Partial<UnflattenedTransaction> = {
  ...transformedExpenseDataWithSubCategory,
  tx: {
    ...transformedExpenseDataWithSubCategory.tx,
    report_id: 'rplD17WeBlha',
  },
};

export const transformedExpenseWithExtractedData: Partial<UnflattenedTransaction> = {
  tx: {
    id: 'txO6d6eiB4JF',
    created_at: new Date('2024-02-11T17:27:43.416Z'),
    txn_dt: new Date('2024-01-19T06:00:00.000Z'),
    categoryDisplayName: 'Food / Burger',
    num_files: 1,
    org_category: 'Food',
    fyle_category: 'unspecified',
    state: 'DRAFT',
    admin_amount: null,
    policy_amount: null,
    skip_reimbursement: false,
    amount: undefined,
    currency: 'USD',
    user_amount: 2.64,
    orig_amount: 219.66,
    orig_currency: 'INR',
    from_dt: null,
    to_dt: null,
    vendor: 'test-1',
    distance: null,
    distance_unit: null,
    locations: [],
    verification_state: null,
    org_user_id: 'ou6cE4dCLH8d',
    expense_number: 'E/2024/02/T/152',
    hotel_is_breakfast_provided: false,
    tax_group_id: null,
    creator_id: 'ou6cE4dCLH8d',
    report_id: null,
    org_category_id: 290006,
    cost_center_id: null,
    project_id: 325126,
    project_name: 'Project 1',
    custom_properties: [
      {
        is_enabled: true,
        name: 'location desc',
        type: 'TEXT',
        value: 'noida',
      },
      {
        is_enabled: true,
        name: 'PP1 where',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'PP 1',
        type: 'DEPENDENT_SELECT',
        value: 'lol',
      },
      {
        is_enabled: true,
        name: 'CC 1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
    ],
    purpose: null,
    billable: null,
    sub_category: 'Burger',
    tax_amount: null,
    corporate_credit_card_expense_group_id: null,
    split_group_id: 'txO6d6eiB4JF',
    split_group_user_amount: null,
    receipt_required: null,
    per_diem_rate_id: null,
    num_days: null,
    mileage_rate_id: null,
    mileage_is_round_trip: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    manual_flag: null,
    policy_flag: null,
    extracted_data: {
      vendor: 'SWIGGY',
      currency: 'INR',
      amount: 219.66,
      date: new Date('2024-01-18T18:30:00.000Z'),
      invoice_dt: null,
      category: 'Food',
    },
    matched_corporate_card_transactions: [],
    source_account_id: 'accO6abI7gZ6T',
    org_category_code: null,
    project_code: null,
    physical_bill: null,
    physical_bill_at: null,
  },
  source: {
    account_id: 'accO6abI7gZ6T',
    account_type: 'PERSONAL_CASH_ACCOUNT',
  },
  ou: {
    id: 'ou6cE4dCLH8d',
    org_id: 'orNbIQloYtfa',
  },
};

export const transformedExpenseWithExtractedData2: Partial<UnflattenedTransaction> = {
  ...transformedExpenseWithExtractedData,
  tx: {
    ...transformedExpenseWithExtractedData.tx,
    amount: undefined,
    currency: undefined,
    vendor: undefined,
    fyle_category: null,
    extracted_data: {
      vendor: 'SWIGGY',
      currency: 'INR',
      amount: 219.66,
      date: new Date('2024-01-18T18:30:00.000Z'),
      invoice_dt: null,
      category: 'Food',
    },
  },
};

export const transformedExpenseWithMatchCCCData: Partial<UnflattenedTransaction> = {
  tx: {
    id: 'txmF3wgfj0Bs',
    created_at: new Date('2024-01-23T01:19:49.370Z'),
    txn_dt: new Date('2018-07-03T13:00:00.000Z'),
    categoryDisplayName: 'Unspecified',
    num_files: 0,
    org_category: 'Unspecified',
    fyle_category: 'Unspecified',
    state: 'DRAFT',
    admin_amount: null,
    policy_amount: null,
    skip_reimbursement: true,
    amount: 260.37,
    currency: 'USD',
    user_amount: 260.37,
    orig_amount: null,
    orig_currency: null,
    from_dt: null,
    to_dt: null,
    vendor: 'test description',
    distance: null,
    distance_unit: null,
    locations: [],
    verification_state: null,
    org_user_id: 'ouokfwl9OEdl',
    expense_number: 'E/2024/01/T/39',
    hotel_is_breakfast_provided: null,
    tax_group_id: null,
    creator_id: 'ouokfwl9OEdl',
    report_id: null,
    org_category_id: 283907,
    cost_center_id: null,
    project_id: null,
    custom_properties: [],
    purpose: null,
    billable: null,
    sub_category: null,
    tax_amount: null,
    corporate_credit_card_expense_group_id: 'btxnSte7sVQCM8',
    split_group_id: 'txmF3wgfj0Bs',
    split_group_user_amount: null,
    receipt_required: null,
    per_diem_rate_id: null,
    num_days: null,
    mileage_rate_id: null,
    mileage_is_round_trip: null,
    mileage_calculated_distance: null,
    mileage_calculated_amount: null,
    manual_flag: null,
    policy_flag: null,
    extracted_data: null,
    matched_corporate_card_transactions: [
      {
        id: 'btxnSte7sVQCM8',
        group_id: 'btxnSte7sVQCM8',
        amount: 260.37,
        vendor: 'test description',
        txn_dt: '2018-07-03T13:00:00.000Z',
        currency: 'USD',
        description: null,
        card_or_account_number: '7620',
        corporate_credit_card_account_number: '7620',
        orig_amount: null,
        orig_currency: null,
        status: TransactionStatus.PENDING,
      },
    ],
    source_account_id: 'acc7F6bwRa52p',
    org_category_code: null,
    physical_bill: null,
    physical_bill_at: null,
  },
  source: {
    account_id: 'acc7F6bwRa52p',
    account_type: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  ou: {
    id: 'ouokfwl9OEdl',
    org_id: 'oroLKHBYQVvj',
  },
};

export const transformedExpenseWithMatchCCCData2: Partial<UnflattenedTransaction> = {
  ...transformedExpenseWithMatchCCCData,
  tx: {
    ...transformedExpenseWithMatchCCCData.tx,
    corporate_credit_card_expense_group_id: null,
    matchCCCId: null,
    matched_corporate_card_transactions: [],
  },
};

export const transformedExpenseWithMatchCCCData3: Partial<UnflattenedTransaction> = {
  ...transformedExpenseWithMatchCCCData,
  tx: {
    ...transformedExpenseWithMatchCCCData.tx,
    corporate_credit_card_expense_group_id: null,
    matchCCCId: 'btxnBdS2Kpvzhy',
    matched_corporate_card_transactions: [
      {
        id: 'btxnBdS2Kpvzhy',
        group_id: 'btxnBdS2Kpvzhy',
        amount: 205.21,
        vendor: 'test description',
        txn_dt: '2018-06-06T08:30:00.000Z',
        currency: 'USD',
        description: null,
        card_or_account_number: '9891',
        corporate_credit_card_account_number: '9891',
        orig_amount: null,
        orig_currency: null,
        status: TransactionStatus.PENDING,
        displayObject: 'Jun 6, 2018 - test description205.21',
      },
    ],
  },
};

export const mileageCategoryTransformedExpenseData: Partial<UnflattenedTransaction> = {
  ...transformedExpenseData,
  tx: { ...transformedExpenseData.tx, org_category: 'MILEAGE' },
};

export const perDiemCategoryTransformedExpenseData: Partial<UnflattenedTransaction> = {
  ...transformedExpenseData,
  tx: { ...transformedExpenseData.tx, org_category: 'PER DIEM' },
};