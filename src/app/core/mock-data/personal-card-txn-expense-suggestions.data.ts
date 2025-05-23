import deepFreeze from 'deep-freeze-strict';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { Expense } from '../models/platform/v1/expense.model';
import { AccountType } from '../models/platform/v1/account.model';
import { ExpenseState } from '../models/expense-state.enum';
import { ApprovalState } from '../models/platform/approval-state.enum';

export const platformPersonalCardTxnExpenseSuggestionsRes: PlatformApiResponse<Expense[]> = deepFreeze({
  data: [
    {
      accounting_export_summary: {},
      activity_details: null,
      added_to_report_at: null,
      admin_amount: null,
      advance_wallet_id: null,
      amount: 90,
      approvals: [
        {
          approver_user: {
            email: 'aastha.b@fyle.in',
            full_name: 'aastha',
            id: 'usRjTPO4r69K',
          },
          approver_user_id: 'usRjTPO4r69K',
          state: ApprovalState.APPROVAL_PENDING,
          approver_order: 0,
        },
      ],
      approver_comments: [],
      category: {
        code: null,
        display_name: 'Unspecified',
        id: 38927,
        name: 'Unspecified',
        sub_category: null,
        system_category: 'Unspecified',
      },
      category_id: 38927,
      claim_amount: 90,
      code: null,
      commute_deduction: null,
      commute_details: null,
      commute_details_id: null,
      cost_center: {
        code: null,
        id: 6335,
        name: 'test-1',
      },
      cost_center_id: 6335,
      created_at: new Date('2024-10-24T10:34:31.922365+00:00'),
      creator_user_id: 'us2KhpQLpzX4',
      currency: 'USD',
      custom_fields: [],
      custom_fields_flattened: {
        dependent_field_1: null,
        pp1: null,
        project_field: null,
      },
      distance: null,
      distance_unit: null,
      employee: {
        business_unit: null,
        code: null,
        custom_fields: [
          {
            name: 'Account Number',
            value: 123,
          },
        ],
        department: {
          code: null,
          display_name: '1234',
          id: 'deptfOJFLA8wxt',
          name: '1234',
          sub_department: null,
        },
        department_id: 'deptfOJFLA8wxt',
        flattened_custom_field: {
          account_number: 123,
        },
        has_accepted_invite: true,
        id: 'ou6kAM3CXV7d',
        is_enabled: true,
        joined_at: null,
        level: null,
        location: null,
        mobile: '+12512603805',
        org_id: 'orrb8EW1zZsy',
        org_name: 'CCC - Multiple statement support - USD',
        title: null,
        user: {
          email: 'kavya.hl@fyle.in',
          full_name: 'Kavya 2',
          id: 'us2KhpQLpzX4',
        },
        user_id: 'us2KhpQLpzX4',
      },
      employee_id: 'ou6kAM3CXV7d',
      ended_at: null,
      expense_rule_data: null,
      expense_rule_id: null,
      extracted_data: null,
      file_ids: [],
      files: [],
      foreign_amount: null,
      foreign_currency: null,
      hotel_is_breakfast_provided: false,
      id: 'txhoujHIA4OD',
      invoice_number: null,
      is_billable: true,
      is_corporate_card_transaction_auto_matched: false,
      is_duplicate_present: false,
      is_exported: null,
      is_manually_flagged: null,
      is_physical_bill_submitted: null,
      is_policy_flagged: null,
      is_receipt_mandatory: null,
      is_reimbursable: true,
      is_split: false,
      is_verified: false,
      last_exported_at: null,
      last_settled_at: null,
      last_verified_at: null,
      locations: [],
      matched_corporate_card_transaction_ids: [],
      matched_corporate_card_transactions: [],
      merchant: 'UTILITY BILL PAYMENT',
      mileage_calculated_amount: null,
      mileage_calculated_distance: null,
      mileage_is_round_trip: null,
      mileage_rate: null,
      mileage_rate_id: null,
      missing_mandatory_fields: {
        amount: false,
        currency: false,
        expense_field_ids: [],
        receipt: true,
      },
      org_id: 'orrb8EW1zZsy',
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
      project: {
        code: null,
        display_name: 'asdf',
        id: 305743,
        name: 'asdf',
        sub_project: null,
      },
      project_id: 305743,
      purpose: 'UTILITY BILL PAYMENT',
      report: null,
      report_id: null,
      report_last_approved_at: null,
      report_last_paid_at: null,
      seq_num: 'E/2024/10/T/21',
      source: 'WEBAPP',
      source_account: {
        id: 'acc8vyjNsN3zh',
        type: AccountType.PERSONAL_CASH_ACCOUNT,
      },
      source_account_id: 'acc8vyjNsN3zh',
      spent_at: new Date('2024-09-11T00:00:00+00:00'),
      split_group_amount: null,
      split_group_id: 'txhoujHIA4OD',
      started_at: null,
      state: ExpenseState.DRAFT,
      state_display_name: 'Incomplete',
      tax_amount: 16.83,
      tax_group: {
        name: 'GST',
        percentage: 0.23,
      },
      tax_group_id: 'tg6RDX1flCnt',
      travel_classes: [],
      updated_at: new Date('2024-10-24T10:34:36.313431+00:00'),
      user: {
        email: 'kavya.hl@fyle.in',
        full_name: 'Kavya 2',
        id: 'us2KhpQLpzX4',
      },
      user_id: 'us2KhpQLpzX4',
      verifications: [],
      verifier_comments: [],
    },
  ],
});

export const platformPersonalCardTxnExpenseSuggestions = deepFreeze([
  {
    purpose: 'UTILITY BILL PAYMENT',
    vendor: 'UTILITY BILL PAYMENT',
    txn_dt: new Date('2024-09-11T00:00:00+00:00'),
    currency: 'USD',
    amount: 90,
    split_group_id: 'txhoujHIA4OD',
  },
]);
