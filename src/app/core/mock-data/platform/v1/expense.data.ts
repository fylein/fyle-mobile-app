import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { PlatformCategory } from 'src/app/core/models/platform/platform-category.model';
import { MileageUnitEnum } from 'src/app/core/models/platform/platform-mileage-rates.model';
import { ApprovalState } from 'src/app/core/models/platform/report-approvals.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { FileType } from 'src/app/core/models/platform/v1/file.model';

export const expenseData: Expense = {
  accounting_export_summary: {},
  added_to_report_at: null,
  admin_amount: null,
  amount: 103500.39,
  approvals: [
    {
      approver_user: {
        email: 'aniruddha.s@fyle.in',
        full_name: 'Aniruddha',
        id: 'usPRnlrMNauG',
      },
      approver_user_id: 'usPRnlrMNauG',
      state: ApprovalState.APPROVAL_PENDING,
    },
  ],
  approver_comments: [],
  category: {
    code: null,
    display_name: 'Entertainment / Others',
    id: 267841,
    name: 'Entertainment',
    sub_category: 'Others',
    system_category: 'Entertainment',
  },
  category_id: 267841,
  claim_amount: 103500.39,
  code: null,
  cost_center: {
    code: null,
    id: 2885,
    name: '80001_UKoffice',
  },
  cost_center_id: 2885,
  created_at: new Date('2023-10-30T06:30:23.577020+00:00'),
  creator_user_id: 'us29O6z3jnd3',
  currency: 'INR',
  custom_fields: [
    {
      name: 'Custom Date.',
      value: '2022-09-14T06:30:00.000Z',
    },
  ],
  custom_fields_flattened: {
    custom_date_: '2022-09-14T06:30:00.000Z',
  },
  distance: null,
  distance_unit: null,
  employee: {
    business_unit: null,
    code: 'lol',
    custom_fields: [
      {
        name: 'Citizenship',
        value: 'lol',
      },
      {
        name: 'test',
        value: 'lol',
      },
      {
        name: 'Citiz',
        value: '90',
      },
      {
        name: 'boo3',
        value: '90',
      },
      {
        name: 'Fyle Test 2',
        value: null,
      },
      {
        name: 'Nick Name',
        value: null,
      },
      {
        name: 'Mobile Number',
        value: null,
      },
      {
        name: 'dummy',
        value: null,
      },
      {
        name: 'dummy2',
        value: null,
      },
      {
        name: 'dummy 2',
        value: null,
      },
      {
        name: 'hello',
        value: null,
      },
      {
        name: 'iion',
        value: '',
      },
      {
        name: 'test chetanya',
        value: 'all',
      },
      {
        name: 'Fuel limit',
        value: 90,
      },
      {
        name: 'Fuel limit 2',
        value: null,
      },
      {
        name: 'Kitne aadmi the?',
        value: 90,
      },
      {
        name: 'Fyle Test',
        value: null,
      },
      {
        name: 'Driver Salary Limit',
        value: null,
      },
      {
        name: 'num_1',
        value: null,
      },
      {
        name: 'New Test Field',
        value: '',
      },
      {
        name: 'mus',
        value: '',
      },
      {
        name: 'RRR',
        value: {
          display: '90',
        },
      },
      {
        name: 'Fyle Test 4',
        value: null,
      },
      {
        name: 'Location',
        value: null,
      },
      {
        name: 'Some location',
        value: null,
      },
      {
        name: 'some loc',
        value: null,
      },
      {
        name: 'Date of Exit',
        value: null,
      },
      {
        name: 'datee',
        value: '2023-04-30T18:30:00.000Z',
      },
      {
        name: 'Permissible Leve',
        value: false,
      },
      {
        name: 'permissible level',
        value: false,
      },
      {
        name: 'Permissive Level',
        value: false,
      },
      {
        name: 'Permissive level',
        value: false,
      },
      {
        name: 'Fyle Test 3',
        value: false,
      },
      {
        name: 'bool',
        value: false,
      },
      {
        name: 'yes no field',
        value: false,
      },
    ],
    department: {
      code: null,
      display_name: '1234',
      id: 'deptUlhu2EDW90',
      name: '1234',
      sub_department: null,
    },
    department_id: 'deptUlhu2EDW90',
    flattened_custom_field: {
      boo3: '90',
      bool: false,
      citiz: '90',
      citizenship: 'lol',
      date_of_exit: null,
      datee: '2023-04-30T18:30:00.000Z',
      driver_salary_limit: null,
      dummy: null,
      dummy2: null,
      dummy_2: null,
      fuel_limit: 90,
      fuel_limit_2: null,
      fyle_test: null,
      fyle_test_2: null,
      fyle_test_3: false,
      fyle_test_4: null,
      hello: null,
      iion: '',
      kitne_aadmi_the_: 90,
      location: null,
      mobile_number: null,
      mus: '',
      new_test_field: '',
      nick_name: null,
      num_1: null,
      permissible_leve: false,
      permissible_level: false,
      permissive_level: false,
      rrr: {
        display: '90',
      },
      some_loc: null,
      some_location: null,
      test: 'lol',
      test_chetanya: 'all',
      yes_no_field: false,
    },
    has_accepted_invite: true,
    id: 'oulTbcFTqYE5',
    is_enabled: true,
    level: {
      band: '3',
      id: 'lvlZtRANhShGf',
      name: '1',
    },
    location: null,
    org_id: 'orKaeO5xojOD',
    org_name: 'Fyle Testing',
    title: null,
    user: {
      email: 'omkar.j@fyle.in',
      full_name: 'Omkar',
      id: 'us29O6z3jnd3',
    },
    user_id: 'us29O6z3jnd3',
  },
  employee_id: 'oulTbcFTqYE5',
  ended_at: null,
  expense_rule_data: null,
  expense_rule_id: null,
  extracted_data: null,
  file_ids: [],
  files: [],
  foreign_amount: null,
  foreign_currency: 'OMR',
  hotel_is_breakfast_provided: false,
  id: 'txe0bYaJlRJf',
  is_billable: null,
  is_corporate_card_transaction_auto_matched: false,
  is_exported: null,
  is_manually_flagged: null,
  is_physical_bill_submitted: null,
  is_policy_flagged: null,
  is_receipt_mandatory: null,
  is_reimbursable: true,
  is_split: false,
  is_verified: false,
  is_weekend_spend: false,
  last_exported_at: null,
  last_settled_at: null,
  last_verified_at: null,
  locations: [],
  matched_corporate_card_transaction_ids: [],
  matched_corporate_card_transactions: [],
  merchant: null,
  mileage_calculated_amount: null,
  mileage_calculated_distance: null,
  mileage_is_round_trip: null,
  mileage_rate: null,
  mileage_rate_id: null,
  missing_mandatory_fields: {
    amount: false,
    currency: false,
    expense_field_ids: [1174726, 1181553],
    receipt: false,
  },
  org_id: 'orKaeO5xojOD',
  per_diem_num_days: null,
  per_diem_rate: null,
  per_diem_rate_id: null,
  physical_bill_submitted_at: null,
  policy_amount: null,
  policy_checks: {
    are_approvers_added: false,
    is_amount_limit_applied: false,
    is_flagged_ever: false,
    violations: null,
  },
  project: null,
  project_id: null,
  purpose: null,
  report: null,
  report_id: null,
  report_last_approved_at: null,
  report_last_paid_at: null,
  report_settlement_id: null,
  seq_num: 'E/2023/10/T/504',
  source: 'RECURRENCE_WEBAPP',
  source_account: {
    id: 'accNL82BMedrB',
    type: AccountType.PERSONAL_CASH_ACCOUNT,
  },
  source_account_id: 'accNL82BMedrB',
  spent_at: new Date('2023-10-30T06:30:23.432000+00:00'),
  split_group_amount: 103500.39,
  split_group_id: 'txe0bYaJlRJf',
  started_at: null,
  state: ExpenseState.DRAFT,
  state_display_name: 'Incomplete',
  tax_amount: null,
  tax_group: {
    name: null,
    percentage: null,
  },
  tax_group_id: null,
  travel_classes: [],
  updated_at: new Date('2023-10-30T06:30:28.730426+00:00'),
  user: {
    email: 'omkar.j@fyle.in',
    full_name: 'Omkar',
    id: 'us29O6z3jnd3',
  },
  user_id: 'us29O6z3jnd3',
  verifier_comments: [],
};

export const expenseResponseData = [expenseData];

export const criticalPolicyViolatedExpense: Expense = {
  ...expenseData,
  policy_amount: 0.00009,
};

type Category = Pick<PlatformCategory, 'code' | 'id' | 'display_name' | 'name' | 'sub_category' | 'system_category'>;

const mileageCategory: Category = {
  code: null,
  display_name: 'mileage display',
  id: 267841,
  name: 'Mileage test',
  sub_category: 'Others',
  system_category: 'Mileage',
};

const perDiemCategory: Category = {
  code: null,
  display_name: 'Per Diem display',
  id: 267841,
  name: 'Per Diem test',
  sub_category: 'Others',
  system_category: 'Per Diem',
};

export const mileageExpenseWithDistance: Expense = {
  ...expenseData,
  distance: 25,
  distance_unit: MileageUnitEnum.KM,
  category: mileageCategory,
};

export const mileageExpenseWithoutDistance: Expense = {
  ...expenseData,
  distance: 0,
  distance_unit: MileageUnitEnum.KM,
  category: mileageCategory,
};

export const perDiemExpenseWithSingleNumDays: Expense = {
  ...expenseData,
  category: perDiemCategory,
  per_diem_num_days: 1,
};

export const perDiemExpenseWithMultipleNumDays: Expense = {
  ...expenseData,
  category: perDiemCategory,
  per_diem_num_days: 3,
};

export const apiExpenses1: Expense[] = [
  {
    accounting_export_summary: {},

    added_to_report_at: null,
    admin_amount: null,
    amount: 10,
    approvals: [],
    approver_comments: [],
    category: {
      code: null,
      display_name: '1 / chumma returns',
      id: 146037,
      name: '1',
      sub_category: 'chumma returns',
      system_category: 'Food',
    },
    category_id: 146037,
    claim_amount: 10,
    code: null,
    cost_center: {
      code: null,
      id: 13795,
      name: '01test2',
    },
    cost_center_id: 13795,
    created_at: new Date('2023-11-07T13:10:11.878550+00:00'),
    creator_user_id: 'usuQPzaT0w9C',
    currency: 'INR',
    custom_fields: [
      {
        is_enabled: true,
        name: 'userlist',
        type: 'USER_LIST',
        value: null,
      },
      {
        is_enabled: true,
        name: 'User List',
        type: 'USER_LIST',
        value: null,
      },
      {
        is_enabled: true,
        name: '# of Gallons',
        type: 'NUMBER',
        value: null,
      },
      {
        is_enabled: true,
        name: 'test',
        type: 'MULTI_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'test 112',
        type: 'LOCATION',
        value: null,
      },
      {
        is_enabled: true,
        name: 'date!',
        type: 'DATE',
        value: null,
      },
      {
        is_enabled: true,
        name: 'select all 2',
        type: 'DATE',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Boolean Field',
        type: 'BOOLEAN',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
    ],
    custom_fields_flattened: {
      __of_gallons: null,
      boolean_field: null,
      date_: null,
      select_all_2: null,
      test: null,
      test_1: null,
      test_112: null,
      user_list: null,
      userlist: null,
    },
    distance: null,
    distance_unit: null,
    employee: {
      business_unit: null,
      code: null,
      custom_fields: [
        {
          name: 'nj',
          value: null,
        },
        {
          name: 'nj1233',
          value: '234',
        },
        {
          name: 'nj12331',
          value: '324',
        },
        {
          name: 'nj123312',
          value: '324',
        },
        {
          name: 'Hybrid human',
          value: null,
        },
        {
          name: 'USelect',
          value: 'Choice 1',
        },
        {
          name: 'Fuel limit',
          value: null,
        },
        {
          name: 'UNum1',
          value: null,
        },
        {
          name: 'Driver salary limit',
          value: null,
        },
        {
          name: 'sdfgf',
          value: 2424,
        },
        {
          name: 'multi',
          value: '',
        },
        {
          name: 'test multi',
          value: ['Choice 2', 'Choice 3'],
        },
        {
          name: 'Place',
          value: null,
        },
        {
          name: 'Location',
          value: null,
        },
        {
          name: 'TCF',
          value: null,
        },
        {
          name: 'Effective date',
          value: null,
        },
        {
          name: 'permissive level',
          value: false,
        },
      ],
      department: null,
      department_id: null,
      flattened_custom_field: {},
      has_accepted_invite: true,
      id: 'ouDdVRE4LxzG',
      is_enabled: true,
      level: null,
      location: null,
      org_id: 'orNVthTo2Zyo',
      org_name: 'Staging Loaded',
      title: null,
      user: {
        email: 'jay.b@fyle.in',
        full_name: 'Jay B',
        id: 'usuQPzaT0w9C',
      },
      user_id: 'usuQPzaT0w9C',
    },
    employee_id: 'ouDdVRE4LxzG',
    ended_at: null,
    expense_rule_data: null,
    expense_rule_id: null,
    extracted_data: {
      amount: null,
      category: 'Food',
      currency: 'INR',
      date: null,
      invoice_dt: null,
      vendor_name: null,
    },
    file_ids: ['fipHq6AkY9eA'],
    files: [
      {
        content_type: 'image/jpeg',
        id: 'fipHq6AkY9eA',
        name: '000.jpeg',
        type: FileType.RECEIPT,
      },
    ],
    foreign_amount: null,
    foreign_currency: null,
    hotel_is_breakfast_provided: null,
    id: 'txDDLtRaflUW',

    is_billable: null,
    is_corporate_card_transaction_auto_matched: false,
    is_exported: null,
    is_manually_flagged: null,
    is_physical_bill_submitted: null,
    is_policy_flagged: true,
    is_receipt_mandatory: null,
    is_reimbursable: true,
    is_split: true,
    is_verified: false,
    is_weekend_spend: false,
    last_exported_at: null,
    last_settled_at: null,
    last_verified_at: null,
    locations: [],
    matched_corporate_card_transaction_ids: [],
    matched_corporate_card_transactions: [],
    merchant: 'State Board of Equalization (5 - HoneComb Aus) (20210809-102717)',
    mileage_calculated_amount: null,
    mileage_calculated_distance: null,
    mileage_is_round_trip: null,
    mileage_rate: null,
    mileage_rate_id: null,
    missing_mandatory_fields: {
      amount: false,
      currency: false,
      expense_field_ids: [],
      receipt: false,
    },
    org_id: 'orNVthTo2Zyo',
    per_diem_num_days: null,
    per_diem_rate: null,
    per_diem_rate_id: null,
    physical_bill_submitted_at: null,
    policy_amount: null,
    policy_checks: {
      are_approvers_added: false,
      is_amount_limit_applied: false,
      is_flagged_ever: true,
      violations: [
        {
          policy_rule_description: ' when the total amount of all expenses in a month exceeds: INR 1. ',
          policy_rule_id: 'tprSbzkbIqw44',
        },
      ],
    },
    project: {
      code: null,
      display_name: 'Project 1',
      id: 316442,
      name: 'Project 1',
      sub_project: null,
    },
    project_id: 316442,
    purpose: 'test_term (2)',
    report: null,
    report_id: null,
    report_last_approved_at: null,
    report_last_paid_at: null,
    report_settlement_id: null,
    seq_num: 'E/2023/11/T/14',
    source: 'MOBILE_DASHCAM_BULK',
    source_account: {
      id: 'acc85nENX65fP',
      type: AccountType.PERSONAL_CASH_ACCOUNT,
    },
    source_account_id: 'acc85nENX65fP',
    spent_at: new Date('2023-07-10T06:30:00+00:00'),
    split_group_amount: 25,
    split_group_id: 'txMPPk5qPsh3',
    started_at: null,
    state: ExpenseState.COMPLETE,
    state_display_name: 'Complete',
    tax_amount: 1.524,
    tax_group: {
      name: 'cgst',
      percentage: 0.18,
    },
    tax_group_id: 'tg3iWuqWhfzB',
    travel_classes: [],
    updated_at: new Date('2023-11-07T13:10:26.762914+00:00'),
    user: {
      email: 'jay.b@fyle.in',
      full_name: 'Jay B',
      id: 'usuQPzaT0w9C',
    },
    user_id: 'usuQPzaT0w9C',
    verifier_comments: [],
  },
  {
    accounting_export_summary: {},

    added_to_report_at: null,
    admin_amount: null,
    amount: 15,
    approvals: [],
    approver_comments: [],
    category: {
      code: null,
      display_name: '1 / 122',
      id: 58350,
      name: '1',
      sub_category: '122',
      system_category: 'Others',
    },
    category_id: 58350,
    claim_amount: 15,
    code: null,
    cost_center: {
      code: null,
      id: 13795,
      name: '01test2',
    },
    cost_center_id: 13795,
    created_at: new Date('2023-11-07T13:10:11.482552+00:00'),
    creator_user_id: 'usuQPzaT0w9C',
    currency: 'INR',
    custom_fields: [
      {
        is_enabled: true,
        name: '# of Gallons',
        type: 'NUMBER',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Boolean Field',
        type: 'BOOLEAN',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'Test_1',
        type: 'DEPENDENT_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'date!',
        type: 'DATE',
        value: null,
      },
      {
        is_enabled: true,
        name: 'userlist',
        type: 'USER_LIST',
        value: null,
      },
      {
        is_enabled: true,
        name: 'test',
        type: 'MULTI_SELECT',
        value: null,
      },
      {
        is_enabled: true,
        name: 'User List',
        type: 'USER_LIST',
        value: null,
      },
      {
        is_enabled: true,
        name: 'select all 2',
        type: 'DATE',
        value: null,
      },
      {
        is_enabled: true,
        name: 'test 112',
        type: 'LOCATION',
        value: null,
      },
    ],
    custom_fields_flattened: {
      __of_gallons: null,
      boolean_field: null,
      date_: null,
      select_all_2: null,
      test: null,
      test_1: null,
      test_112: null,
      user_list: null,
      userlist: null,
    },
    distance: null,
    distance_unit: null,
    employee: {
      business_unit: null,
      code: null,
      custom_fields: [
        {
          name: 'nj',
          value: null,
        },
        {
          name: 'nj1233',
          value: '234',
        },
        {
          name: 'nj12331',
          value: '324',
        },
        {
          name: 'nj123312',
          value: '324',
        },
        {
          name: 'Hybrid human',
          value: null,
        },
        {
          name: 'USelect',
          value: 'Choice 1',
        },
        {
          name: 'Fuel limit',
          value: null,
        },
        {
          name: 'UNum1',
          value: null,
        },
        {
          name: 'Driver salary limit',
          value: null,
        },
        {
          name: 'sdfgf',
          value: 2424,
        },
        {
          name: 'multi',
          value: '',
        },
        {
          name: 'test multi',
          value: ['Choice 2', 'Choice 3'],
        },
        {
          name: 'Place',
          value: null,
        },
        {
          name: 'Location',
          value: null,
        },
        {
          name: 'TCF',
          value: null,
        },
        {
          name: 'Effective date',
          value: null,
        },
        {
          name: 'permissive level',
          value: false,
        },
      ],
      department: null,
      department_id: null,
      flattened_custom_field: {},
      has_accepted_invite: true,
      id: 'ouDdVRE4LxzG',
      is_enabled: true,
      level: null,
      location: null,
      org_id: 'orNVthTo2Zyo',
      org_name: 'Staging Loaded',
      title: null,
      user: {
        email: 'jay.b@fyle.in',
        full_name: 'Jay B',
        id: 'usuQPzaT0w9C',
      },
      user_id: 'usuQPzaT0w9C',
    },
    employee_id: 'ouDdVRE4LxzG',
    ended_at: null,
    expense_rule_data: null,
    expense_rule_id: null,
    extracted_data: {
      amount: null,
      category: 'Food',
      currency: 'INR',
      date: null,
      invoice_dt: null,
      vendor_name: null,
    },
    file_ids: ['fiKxPp6qKML7'],
    files: [
      {
        content_type: 'image/jpeg',
        id: 'fiKxPp6qKML7',
        name: '000.jpeg',
        type: FileType.RECEIPT,
      },
    ],
    foreign_amount: null,
    foreign_currency: null,
    hotel_is_breakfast_provided: null,
    id: 'tx5WDG9lxBDT',

    is_billable: null,
    is_corporate_card_transaction_auto_matched: false,
    is_exported: null,
    is_manually_flagged: null,
    is_physical_bill_submitted: null,
    is_policy_flagged: true,
    is_receipt_mandatory: null,
    is_reimbursable: true,
    is_split: true,
    is_verified: false,
    is_weekend_spend: false,
    last_exported_at: null,
    last_settled_at: null,
    last_verified_at: null,
    locations: [],
    matched_corporate_card_transaction_ids: [],
    matched_corporate_card_transactions: [],
    merchant: 'State Board of Equalization (5 - HoneComb Aus) (20210809-102717)',
    mileage_calculated_amount: null,
    mileage_calculated_distance: null,
    mileage_is_round_trip: null,
    mileage_rate: null,
    mileage_rate_id: null,
    missing_mandatory_fields: {
      amount: false,
      currency: false,
      expense_field_ids: [],
      receipt: false,
    },
    org_id: 'orNVthTo2Zyo',
    per_diem_num_days: null,
    per_diem_rate: null,
    per_diem_rate_id: null,
    physical_bill_submitted_at: null,
    policy_amount: null,
    policy_checks: {
      are_approvers_added: false,
      is_amount_limit_applied: false,
      is_flagged_ever: true,
      violations: [
        {
          policy_rule_description: ' when the total amount of all expenses in a month exceeds: INR 1. ',
          policy_rule_id: 'tprSbzkbIqw44',
        },
      ],
    },
    project: {
      code: null,
      display_name: 'Project 1',
      id: 316442,
      name: 'Project 1',
      sub_project: null,
    },
    project_id: 316442,
    purpose: 'test_term (1)',
    report: null,
    report_id: null,
    report_last_approved_at: null,
    report_last_paid_at: null,
    report_settlement_id: null,
    seq_num: 'E/2023/11/T/13',
    source: 'MOBILE_DASHCAM_BULK',
    source_account: {
      id: 'acc85nENX65fP',
      type: AccountType.PERSONAL_CASH_ACCOUNT,
    },
    source_account_id: 'acc85nENX65fP',
    spent_at: new Date('2023-07-10T06:30:00+00:00'),
    split_group_amount: 25,
    split_group_id: 'txMPPk5qPsh3',
    started_at: null,
    state: ExpenseState.COMPLETE,
    state_display_name: 'Complete',
    tax_amount: 2.286,
    tax_group: {
      name: 'cgst',
      percentage: 0.18,
    },
    tax_group_id: 'tg3iWuqWhfzB',
    travel_classes: [],
    updated_at: new Date('2023-11-07T13:10:22.507923+00:00'),
    user: {
      email: 'jay.b@fyle.in',
      full_name: 'Jay B',
      id: 'usuQPzaT0w9C',
    },
    user_id: 'usuQPzaT0w9C',
    verifier_comments: [],
  },
];
