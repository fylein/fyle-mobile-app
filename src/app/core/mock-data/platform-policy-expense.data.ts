import { PlatformPolicyExpense } from '../models/platform/platform-policy-expense.model';
import { ExpensePolicyStates } from '../models/platform/platform-expense-policy-states.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const platformPolicyExpenseData1: PlatformPolicyExpense = {
  spent_at: new Date('2023-02-07T17:00:00.000Z'),
  started_at: new Date('2023-02-04T17:00:00.000Z'),
  ended_at: new Date('2023-02-05T17:00:00.000Z'),
  merchant: 'Australian Taxation Office',
  foreign_currency: null,
  foreign_amount: null,
  claim_amount: 54,
  purpose: 'test_term',
  cost_center_id: 13795,
  category_id: 89550,
  project_id: 290054,
  source_account_id: 'acc5APeygFjRd',
  tax_amount: 8.24,
  tax_group_id: 'tg3iWuqWhfzB',
  is_reimbursable: true,
  locations: [],
  custom_fields: [
    {
      id: 200227,
      mandatory: false,
      name: 'userlist',
      options: [],
      placeholder: 'userlist_custom_field',
      prefix: '',
      type: 'USER_LIST',
      value: [],
    },
    {
      id: 210649,
      mandatory: false,
      name: 'User List',
      options: [],
      placeholder: 'User List',
      prefix: '',
      type: 'USER_LIST',
      value: [],
    },
    {
      id: 210281,
      mandatory: false,
      name: 'test',
      options: [
        {
          label: 'asd',
          value: 'asd',
        },
        {
          label: 'asdf',
          value: 'asdf',
        },
        {
          label: 'asdff',
          value: 'asdff',
        },
      ],
      placeholder: '123test',
      prefix: '',
      type: 'MULTI_SELECT',
      value: '',
    },
    {
      id: 212819,
      mandatory: false,
      name: 'category2',
      options: [
        {
          label: 'asdf',
          value: 'asdf',
        },
        {
          label: 'asdfa',
          value: 'asdfa',
        },
      ],
      placeholder: 'category2',
      prefix: '',
      type: 'MULTI_SELECT',
      value: '',
    },
    {
      id: 206206,
      mandatory: false,
      name: 'pub create hola 1',
      options: [],
      placeholder: 'pub create hola 1',
      prefix: '',
      type: 'LOCATION',
      value: null,
    },
    {
      id: 211321,
      mandatory: false,
      name: 'test 112',
      options: [],
      placeholder: 'placeholder',
      prefix: '',
      type: 'LOCATION',
      value: null,
    },
    {
      id: 206198,
      mandatory: false,
      name: '2232323',
      options: [],
      placeholder: 'adsf',
      prefix: '',
      type: 'DATE',
      value: null,
    },
    {
      id: 211326,
      mandatory: false,
      name: 'select all 2',
      options: [],
      placeholder: 'helo date',
      prefix: '',
      type: 'DATE',
      value: null,
    },
  ],
  num_files: 0,
  is_matching_ccc: false,
  travel_classes: [],
};

export const platformPolicyExpenseData2: PlatformPolicyExpense = {
  merchant: 'Uber',
  spent_at: new Date('2023-02-21T06:30:00.000Z'),
  foreign_currency: null,
  foreign_amount: null,
  claim_amount: 20453.73,
  purpose: 'Test',
  cost_center_id: 4736,
  category_id: 113717,
  project_id: 3898,
  source_account_id: 'acc1Wy9lM0dHV',
  is_reimbursable: true,
  distance: 619.81,
  distance_unit: 'MILES',
  locations: [
    {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      formatted_address:
        'Shop No:8, Sahar Cargo, Andheri Victor Mati Lane, Sahar Rd, Tank View, Sahar Village, Andheri East, Mumbai, Maharashtra 400099, India',
      latitude: 19.098039,
      longitude: 72.867626,
      display:
        'Bangalore Airport Terminal Services Private Limited, Sahar Road, Tank View, Sahar Village, Andheri East, Mumbai, Maharashtra, India',
    },
  ],
  custom_fields: [
    {
      id: 174083,
      mandatory: false,
      name: 'userlist test',
      options: [],
      placeholder: 'userlist test',
      prefix: '',
      type: 'USER_LIST',
      value: null,
    },
    {
      id: 218778,
      mandatory: false,
      name: 'select type field',
      options: [
        {
          label: 'select-1',
          value: 'select-1',
        },
        {
          label: 'select-2',
          value: 'select-2',
        },
      ],
      placeholder: 'select custom field',
      prefix: '',
      type: 'SELECT',
      value: 'select-1',
    },
  ],
  id: '1234',
  mileage_rate_id: 24329,
  mileage_calculated_distance: 619.81,
  mileage_calculated_amount: 20453.73,
  travel_classes: ['economy', 'business'],
  tax_amount: 0,
  tax_group_id: 'txid1',
  is_billable: false,
  started_at: undefined,
  ended_at: undefined,
  per_diem_rate_id: 0,
  per_diem_num_days: 0,
  num_files: 0,
  is_matching_ccc: false,
};

export const platformPolicyExpenseData3: PlatformPolicyExpense = {
  ...platformPolicyExpenseData2,
  travel_classes: ['luxury'],
};

export const platformPolicyExpenseData4: PlatformPolicyExpense = {
  ...platformPolicyExpenseData2,
  travel_classes: ['first-class'],
};

export const platformPolicyExpenseData5: PlatformPolicyExpense = {
  ...platformPolicyExpenseData2,
  is_reimbursable: null,
};

export const expensePolicyStatesData: PlatformApiResponse<ExpensePolicyStates> = {
  count: 1,
  data: [
    {
      expense_id: 'txVTmNOp5JEa',
      final_desired_state: {
        add_approver_user_ids: [],
        amount: null,
        expense_id: 'txVTmNOp5JEa',
        flag: true,
        is_receipt_mandatory: false,
        remove_employee_approver1: false,
        run_status: 'SUCCESS',
        run_summary: ['expense will be flagged for verification and approval'],
      },
      individual_desired_states: [
        {
          add_approver_user_ids: [],
          amount: null,
          expense_id: 'txVTmNOp5JEa',
          expense_policy_rule: {
            action_show_warning: false,
            description:
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000. ',
            id: 'tprlDUfXa0idO',
          },
          expense_policy_rule_id: 'tprlDUfXa0idO',
          expenses_query_object_params: {
            limit_end_date: '2023-03-01',
            limit_start_date: '2023-02-01',
            params: {
              category_id: 'in.(1630)',
              employee_id: 'eq.ouWmQvnfr9x0',
              cost_center_id: 'CostCentId2',
              currency: 'INR',
              mileage_rate_id: 'MilRatId2',
              project_id: 'ProId2',
            },
          },
          run_result: ['expense will be flagged for verification and approval'],
          run_status: 'VIOLATED_ACTION_SUCCESS',
        },
      ],
    },
  ],
  offset: 0,
};

export const emptyApiResponse: PlatformApiResponse<ExpensePolicyStates> = {
  count: 0,
  data: [],
  offset: 0,
};

export const ApproverExpensePolicyStatesData: PlatformApiResponse<ExpensePolicyStates> = {
  count: 1,
  data: [
    {
      expense_id: 'txRNWeQRXhso',
      final_desired_state: {
        add_approver_user_ids: [],
        amount: null,
        expense_id: 'txRNWeQRXhso',
        flag: false,
        is_receipt_mandatory: false,
        remove_employee_approver1: false,
        run_status: 'SUCCESS',
        run_summary: [],
      },
      individual_desired_states: [],
    },
  ],
  offset: 0,
};

export const splitExpensePolicyExp: PlatformPolicyExpense = {
  id: 'txqhb1IwrujH',
  spent_at: new Date('2023-02-15T17:00:00.000Z'),
  merchant: 'New new new',
  foreign_currency: null,
  foreign_amount: null,
  claim_amount: 20.4,
  purpose: 'test_term (2) (1)',
  cost_center_id: 13793,
  category_id: 110351,
  project_id: 3943,
  source_account_id: 'acc5APeygFjRd',
  tax_amount: null,
  tax_group_id: 'tg3iWuqWhfzB',
  is_billable: null,
  is_reimbursable: true,
  distance: null,
  distance_unit: null,
  locations: [],
  custom_fields: [
    {
      name: 'userlist',
      value: null,
    },
    {
      name: 'User List',
      value: null,
    },
    {
      name: 'test',
      value: null,
    },
    {
      name: 'category2',
      value: null,
    },
    {
      name: 'test location',
      value: null,
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
  started_at: null,
  ended_at: null,
  per_diem_rate_id: null,
  per_diem_num_days: null,
  num_files: 1,
  mileage_calculated_distance: null,
  mileage_calculated_amount: null,
  travel_classes: [],
};
