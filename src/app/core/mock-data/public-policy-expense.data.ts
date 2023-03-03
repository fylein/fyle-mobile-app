import { PublicPolicyExpense } from '../models/public-policy-expense.model';
import { ExpensePolicy } from '../models/platform/platform-expense-policy.model';
import { PolicyViolation } from '../models/policy-violation.model';

export const publicPolicyExpenseData1: PublicPolicyExpense = {
  skip_reimbursement: false,
  source: 'MOBILE',
  state: 'COMPLETE',
  txn_dt: new Date('2023-02-21T06:30:00.000Z'),
  org_category_id: 113717,
  currency: 'INR',
  amount: 20453.73,
  distance: 619.81,
  mileage_calculated_amount: 20453.73,
  mileage_calculated_distance: 619.81,
  policy_amount: null,
  mileage_vehicle_type: 'bicycle',
  mileage_rate: 33,
  distance_unit: 'MILES',
  mileage_is_round_trip: false,
  fyle_category: 'flight',
  org_user_id: 'ouH8VvkHBg9H',
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
  custom_properties: [
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
  source_account_id: 'acc1Wy9lM0dHV',
  orig_currency: null,
  orig_amount: null,
  project_id: 3898,
  purpose: 'Test',
  category: null,
  cost_center_id: 4736,
  mileage_rate_id: 24329,
  activity_details: '',
  activity_policy_pending: false,
  admin_amount: 0,
  billable: false,
  bus_travel_class: 'luxury',
  created_at: undefined,
  creator_id: '',
  exchange_rate: 0,
  exchange_rate_diff_percentage: 0,
  expense_number: '',
  external_id: '',
  extracted_data: undefined,
  flight_journey_travel_class: 'economy',
  flight_return_travel_class: 'business',
  from_dt: undefined,
  hotel_is_breakfast_provided: false,
  id: '1234',
  is_matching_ccc_expense: false,
  invoice_number: 0,
  mandatory_fields_present: false,
  manual_flag: false,
  num_days: 0,
  num_files: 0,
  payment_id: '',
  per_diem_rate_id: 0,
  physical_bill: false,
  physical_bill_at: undefined,
  platform_vendor: '',
  platform_vendor_id: '',
  policy_flag: false,
  policy_state: '',
  proposed_exchange_rate: 0,
  report_id: '',
  reported_at: undefined,
  split_group_id: '',
  split_group_user_amount: 0,
  status_id: '',
  tax: '',
  tax_amount: 0,
  tax_group_id: 'txid1',
  taxi_travel_class: '',
  to_dt: undefined,
  train_travel_class: 'first-class',
  updated_at: undefined,
  user_amount: 0,
  user_reason_for_duplicate_expenses: '',
  vendor: 'Uber',
  vendor_id: 0,
};

export const publicPolicyExpenseData2: PublicPolicyExpense = {
  ...publicPolicyExpenseData1,
  fyle_category: 'airlines',
};

export const publicPolicyExpenseData3: PublicPolicyExpense = {
  ...publicPolicyExpenseData1,
  fyle_category: 'bus',
};

export const publicPolicyExpenseData4: PublicPolicyExpense = {
  ...publicPolicyExpenseData1,
  fyle_category: 'train',
};

export const publicPolicyExpenseData5: PublicPolicyExpense = {
  ...publicPolicyExpenseData1,
  skip_reimbursement: null,
};

export const publicPolicyExpenseData6: PublicPolicyExpense = {
  ...publicPolicyExpenseData1,
  locations: null,
};

export const publicPolicyExpenseData7: PublicPolicyExpense = {
  ...publicPolicyExpenseData1,
  fyle_category: null,
};

export const expensePolicyData: ExpensePolicy = {
  data: {
    final_desired_state: {
      add_approver_user_ids: [],
      amount: null,
      flag: true,
      is_receipt_mandatory: false,
      remove_employee_approver1: false,
      run_status: 'SUCCESS',
      run_summary: ['expense will be flagged for verification and approval'],
    },
    individual_desired_states: [
      {
        add_approver_user_ids: [],
        amount: 0.00005,
        expense_policy_rule: {
          action_show_warning: true,
          description:
            'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
          id: 'tprlDUfXa0idO',
        },
        expense_policy_rule_id: 'tprlDUfXa0idO',
        expenses_query_object_params: {
          limit_end_date: '2023-03-01',
          limit_start_date: '2023-02-01',
          params: {
            category_id: 'in.(1630)',
            employee_id: 'eq.ouWmQvnfr9x0',
            cost_center_id: 'CostCentId1',
            currency: 'INR',
            mileage_rate_id: 'MilRatId1',
            project_id: 'ProId1',
          },
        },
        run_result: ['expense will be flagged for verification and approval'],
        run_status: 'VIOLATED_ACTION_SUCCESS',
      },
    ],
  },
};

export const policyViolationData: PolicyViolation = {
  data: {
    individual_desired_states: [
      {
        expense_id: 'txGNXsC1bmIo',
        add_approver_user_ids: [],
        amount: 0.00005,
        expense_policy_rule: {
          action_show_warning: true,
          description:
            'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
          id: 'tprlDUfXa0idO',
        },
        expense_policy_rule_id: 'tprlDUfXa0idO',
        expenses_query_object_params: {
          limit_end_date: '2023-03-01',
          limit_start_date: '2023-02-01',
          params: {
            category_id: 'in.(1630)',
            employee_id: 'eq.ouWmQvnfr9x0',
            cost_center_id: 'CostCentId1',
            currency: 'INR',
            mileage_rate_id: 'MilRatId1',
            project_id: 'ProId1',
          },
        },
        run_result: ['expense will be flagged for verification and approval'],
        run_status: 'VIOLATED_ACTION_SUCCESS',
      },
    ],
    final_desired_state: {
      add_approver_user_ids: [],
      amount: null,
      flag: true,
      is_receipt_mandatory: false,
      remove_employee_approver1: false,
      run_status: 'SUCCESS',
      run_summary: ['expense will be flagged for verification and approval'],
    },
  },
  amount: 100,
  currency: 'INR',
  name: 'Policy Violation 1',
  type: 'Expense Policy',
};

export const violations: { [id: string]: PolicyViolation } = {
  txVTmNOp5JEa: policyViolationData,
};
