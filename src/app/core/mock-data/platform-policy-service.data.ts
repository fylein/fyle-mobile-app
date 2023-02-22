import { PlatformPolicyExpense } from '../models/platform/platform-policy-expense.model';
import { ExpensePolicyStates } from '../models/platform/platform-expense-policy-states.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const platformPolicyServiceData: PlatformPolicyExpense = {
  merchant: '',
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
      display_name:
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
  travel_classes: [],
  tax_amount: 0,
  tax_group_id: '',
  is_billable: false,
  started_at: undefined,
  ended_at: undefined,
  per_diem_rate_id: 0,
  per_diem_num_days: 0,
  num_files: 0,
  is_matching_ccc: false,
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
