import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { MileageUnitEnum } from 'src/app/core/models/platform/platform-mileage-rates.model';
import { ReportState } from 'src/app/core/models/platform/platform-report.model';
import { ApprovalState } from 'src/app/core/models/platform/report-approvals.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

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

export const mileageExpense: Expense = {
  accounting_export_summary: {},
  added_to_report_at: new Date('2023-11-01T00:10:01.286157+00:00'),
  admin_amount: null,
  amount: 459,
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
    display_name: 'Mileage / Odd Hours',
    id: 247012,
    name: 'Mileage',
    sub_category: 'Odd Hours',
    system_category: 'Mileage',
  },
  category_id: 247012,
  claim_amount: 459,
  code: null,
  cost_center: {
    code: null,
    id: 2885,
    name: '80001_UKoffice',
  },
  cost_center_id: 2885,
  created_at: new Date('2023-02-01T05:41:41.004325+00:00'),
  creator_user_id: 'us29O6z3jnd3',
  currency: 'USD',
  custom_fields: [],
  custom_fields_flattened: {},
  distance: 9,
  distance_unit: MileageUnitEnum.MILES,
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
  foreign_currency: null,
  hotel_is_breakfast_provided: null,
  id: 'txzPPNvxs98T',
  is_billable: true,
  is_corporate_card_transaction_auto_matched: false,
  is_exported: null,
  is_manually_flagged: null,
  is_physical_bill_submitted: null,
  is_policy_flagged: true,
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
  mileage_rate: {
    code: null,
    id: 494,
    vehicle_type: 'four_wheeler',
  },
  mileage_rate_id: 494,
  missing_mandatory_fields: {
    amount: false,
    currency: false,
    expense_field_ids: [],
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
    is_flagged_ever: true,
    violations: [
      {
        policy_rule_description: ' when expense amount exceeds: USD 10. ',
        policy_rule_id: 'tprOf6n9QHtZL',
      },
    ],
  },
  project: {
    code: null,
    display_name: 'as123',
    id: 36609,
    name: 'as123',
    sub_project: null,
  },
  project_id: 36609,
  purpose: null,
  report: {
    amount: 36164626.4678,
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
    id: 'rpFvmTgyeBjN',
    last_approved_at: null,
    last_paid_at: null,
    last_submitted_at: new Date('2023-11-01T00:10:01.286157+00:00'),
    last_verified_at: null,
    reimbursement_id: null,
    reimbursement_seq_num: null,
    seq_num: 'C/2023/11/R/2',
    settlement_id: null,
    state: ReportState.APPROVER_PENDING,
    title: '#1: October 2023',
  },
  report_id: 'rpFvmTgyeBjN',
  report_last_approved_at: null,
  report_last_paid_at: null,
  report_settlement_id: null,
  seq_num: 'E/2023/02/T/4',
  source: 'WEBAPP_BULK',
  source_account: {
    id: 'accNL82BMedrB',
    type: AccountType.PERSONAL_CASH_ACCOUNT,
  },
  source_account_id: 'accNL82BMedrB',
  spent_at: new Date('2023-02-01T06:30:00+00:00'),
  split_group_amount: 459,
  split_group_id: 'txzPPNvxs98T',
  started_at: null,
  state: ExpenseState.APPROVER_PENDING,
  state_display_name: 'Submitted',
  tax_amount: null,
  tax_group: {
    name: null,
    percentage: null,
  },
  tax_group_id: null,
  travel_classes: [],
  updated_at: new Date('2023-11-01T00:11:02.572303+00:00'),
  user: {
    email: 'omkar.j@fyle.in',
    full_name: 'Omkar',
    id: 'us29O6z3jnd3',
  },
  user_id: 'us29O6z3jnd3',
  verifier_comments: [],
};

export const perDiemExpense: Expense = {
  accounting_export_summary: {},
  added_to_report_at: '2023-11-02T07:56:41.065000+00:00',
  admin_amount: null,
  amount: 440,
  approvals: [
    {
      approver_user: {
        email: 'adityabaddur+test_accounts@gmail.com',
        full_name: 'ab',
        id: 'us6z24IHcdEa',
      },
      approver_user_id: 'us6z24IHcdEa',
      state: ApprovalState.APPROVAL_PENDING,
    },
  ],
  approver_comments: [],
  category: {
    code: null,
    display_name: 'Per Diem / sfrf',
    id: 116005,
    name: 'Per Diem',
    sub_category: 'sfrf',
    system_category: 'Per Diem',
  },
  category_id: 116005,
  claim_amount: 440,
  code: null,
  cost_center: null,
  cost_center_id: null,
  created_at: '2023-11-02T07:46:42.549015+00:00',
  creator_user_id: 'usvKA4X8Ugcr',
  currency: 'INR',
  custom_fields: [
    {
      name: 'Multi Type',
      value: '',
    },
    {
      name: 'name',
      value: null,
    },
    {
      name: 'Cost Center Dep Field Level 1',
      value: '',
    },
    {
      name: 'Cost Center Dep Field Level 123',
      value: '',
    },
    {
      name: 'test',
      value: '',
    },
    {
      name: 'test10',
      value: '',
    },
    {
      name: 'test11',
      value: '',
    },
    {
      name: 'test12',
      value: '',
    },
    {
      name: 'test19',
      value: '',
    },
    {
      name: 'test20',
      value: '',
    },
  ],
  custom_fields_flattened: {
    cost_center_dep_field_level_1: '',
    cost_center_dep_field_level_123: '',
    multi_type: '',
    name: null,
    test: '',
    test10: '',
    test11: '',
    test12: '',
    test19: '',
    test20: '',
  },
  distance: null,
  distance_unit: null,
  employee: {
    business_unit: 'tst',
    code: 'A',
    custom_fields: [
      {
        name: 'Previous work Experience',
        value: 5,
      },
      {
        name: 'Nationality',
        value: 'Choice 1',
      },
      {
        name: 'multi',
        value: ['Choice 2', 'Choice 3'],
      },
      {
        name: 'bnbnbnb',
        value: 'test',
      },
      {
        name: 'mnm',
        value: true,
      },
      {
        name: 'nbnbnb',
        value: {
          city: 'Rome',
          country: 'Italy',
          display: 'Testaccio, Rome, Metropolitan City of Rome Capital, Italy',
          formatted_address: 'Monte Testaccio, 00153 Rome, Metropolitan City of Rome Capital, Italy',
          latitude: 41.87595200000001,
          longitude: 12.475694,
          state: 'Lazio',
        },
      },
      {
        name: 'nmn',
        value: {
          city: 'Chemmarathur',
          country: 'India',
          display: 'Test Ground Vadakara, Chemmarathur, Kerala, India',
          formatted_address: 'JJ4R+FMP, Chemmarathur, Kerala 673104, India',
          latitude: 11.6062154,
          longitude: 75.6417055,
          state: 'Kerala',
        },
      },
      {
        name: 'mnmm',
        value: {
          city: 'Chemmarathur',
          country: 'India',
          display: 'Test Ground Vadakara, Chemmarathur, Kerala, India',
          formatted_address: 'JJ4R+FMP, Chemmarathur, Kerala 673104, India',
          latitude: 11.6062154,
          longitude: 75.6417055,
          state: 'Kerala',
        },
      },
      {
        name: 'test number',
        value: 4,
      },
    ],
    department: {
      code: null,
      display_name: '001',
      id: 'deptlvDtgtBn8I',
      name: '001',
      sub_department: null,
    },
    department_id: 'deptlvDtgtBn8I',
    flattened_custom_field: {
      bnbnbnb: 'test',
      mnm: true,
      mnmm: {
        city: 'Chemmarathur',
        country: 'India',
        display: 'Test Ground Vadakara, Chemmarathur, Kerala, India',
        formatted_address: 'JJ4R+FMP, Chemmarathur, Kerala 673104, India',
        latitude: 11.6062154,
        longitude: 75.6417055,
        state: 'Kerala',
      },
      multi: ['Choice 2', 'Choice 3'],
      nationality: 'Choice 1',
      nbnbnb: {
        city: 'Rome',
        country: 'Italy',
        display: 'Testaccio, Rome, Metropolitan City of Rome Capital, Italy',
        formatted_address: 'Monte Testaccio, 00153 Rome, Metropolitan City of Rome Capital, Italy',
        latitude: 41.87595200000001,
        longitude: 12.475694,
        state: 'Lazio',
      },
      nmn: {
        city: 'Chemmarathur',
        country: 'India',
        display: 'Test Ground Vadakara, Chemmarathur, Kerala, India',
        formatted_address: 'JJ4R+FMP, Chemmarathur, Kerala 673104, India',
        latitude: 11.6062154,
        longitude: 75.6417055,
        state: 'Kerala',
      },
      previous_work_experience: 5,
      test_number: 4,
    },
    has_accepted_invite: true,
    id: 'ouCI4UQ2G0K1',
    is_enabled: true,
    level: null,
    location: 'test',
    org_id: 'orrjqbDbeP9p',
    org_name: 'Fyle Staging',
    title: 'test',
    user: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
      id: 'usvKA4X8Ugcr',
    },
    user_id: 'usvKA4X8Ugcr',
  },
  employee_id: 'ouCI4UQ2G0K1',
  ended_at: '2023-11-22T06:30:00+00:00',
  expense_rule_data: null,
  expense_rule_id: null,
  extracted_data: null,
  file_ids: [],
  files: [],
  foreign_amount: null,
  foreign_currency: null,
  hotel_is_breakfast_provided: null,
  id: 'txhlIisPqUxc',
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
    expense_field_ids: [193988],
    receipt: false,
  },
  org_id: 'orrjqbDbeP9p',
  per_diem_num_days: 22,
  per_diem_rate: {
    code: null,
    id: 5463,
    name: 'aaaaa',
  },
  per_diem_rate_id: 5463,
  physical_bill_submitted_at: null,
  policy_amount: null,
  policy_checks: {
    are_approvers_added: false,
    is_amount_limit_applied: false,
    is_flagged_ever: false,
    violations: null,
  },
  project: {
    code: null,
    display_name: '#$',
    id: 201184,
    name: '#$',
    sub_project: null,
  },
  project_id: 201184,
  purpose: '90',
  report: {
    amount: 855.76,
    approvals: [
      {
        approver_user: {
          email: 'adityabaddur+test_accounts@gmail.com',
          full_name: 'ab',
          id: 'us6z24IHcdEa',
        },
        approver_user_id: 'us6z24IHcdEa',
        state: ApprovalState.APPROVAL_PENDING,
      },
    ],
    id: 'rpFvmTgyeBjN',
    last_approved_at: null,
    last_paid_at: null,
    last_submitted_at: '2023-10-31T00:00:01.237+00:00',
    last_verified_at: null,
    reimbursement_id: null,
    reimbursement_seq_num: null,
    seq_num: 'C/2023/10/R/13',
    settlement_id: null,
    state: ReportState.APPROVER_PENDING,
    title: '#5: October 2023',
  },
  report_id: 'rpFvmTgyeBjN',
  report_last_approved_at: null,
  report_last_paid_at: null,
  report_settlement_id: null,
  seq_num: 'E/2023/11/T/2',
  source: 'WEBAPP',
  source_account: {
    id: 'accfziaxbGFVW',
    type: AccountType.PERSONAL_CASH_ACCOUNT,
  },
  source_account_id: 'accfziaxbGFVW',
  spent_at: '2023-11-01T06:30:00+00:00',
  split_group_amount: 440,
  split_group_id: 'txhlIisPqUxc',
  started_at: '2023-11-01T06:30:00+00:00',
  state: ExpenseState.APPROVER_PENDING,
  state_display_name: 'Submitted',
  tax_amount: null,
  tax_group: {
    name: null,
    percentage: null,
  },
  tax_group_id: null,
  travel_classes: [],
  updated_at: '2023-11-02T07:56:41.156199+00:00',
  user: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
    id: 'usvKA4X8Ugcr',
  },
  user_id: 'usvKA4X8Ugcr',
  verifier_comments: [],
};
