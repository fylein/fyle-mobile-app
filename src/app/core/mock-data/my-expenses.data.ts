import { ExpenseFilters } from 'src/app/fyle/my-expenses/expenses-filters.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { Expense } from '../models/expense.model';
import { UnformattedTransaction } from '../models/my-expenses.model';
import { filterOptions1 } from './filter.data';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { selectedFilters1 } from './selected-filters.data';
import { apiExpenseRes } from './expense.data';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report/create-new-report.component';
import { Mode } from '@ionic/core';
import { AddTxnToReportDialogComponent } from 'src/app/fyle/my-expenses/add-txn-to-report-dialog/add-txn-to-report-dialog.component';

export const expectedFilterPill1 = [
  {
    label: 'Type',
    type: 'state',
    value: 'Incomplete, Complete',
  },
  {
    label: 'Receipts Attached',
    type: 'receiptsAttached',
    value: 'yes',
  },
  {
    label: 'Expense Type',
    type: 'type',
    value: 'Per Diem, Mileage',
  },
  {
    label: 'Sort By',
    type: 'sort',
    value: 'category - a to z',
  },
  {
    label: 'Cards',
    type: 'cardNumbers',
    value: '****1234, ****5678',
  },
  {
    label: 'Split Expense',
    type: 'splitExpense',
    value: 'yes',
  },
];

export const filters1: Partial<ExpenseFilters> = {
  state: ['DRAFT', 'READY_TO_REPORT'],
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'tx_org_category',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};

export const expectedFilterPill2 = [
  {
    label: 'Receipts Attached',
    type: 'receiptsAttached',
    value: 'yes',
  },
  {
    label: 'Sort By',
    type: 'sort',
    value: 'category - a to z',
  },
  {
    label: 'Split Expense',
    type: 'splitExpense',
    value: 'yes',
  },
];

export const filters2: Partial<ExpenseFilters> = {
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  sortParam: 'tx_org_category',
  sortDir: 'asc',
  splitExpense: 'YES',
};

export const unformattedTxnData: UnformattedTransaction[] = [
  {
    created_at: new Date('2023-02-08T06:47:48.414Z'),
    updated_at: new Date('2023-02-08T06:47:48.414Z'),
    id: 'txNVtsqF8Siq',
    source: 'MOBILE_DASHCAM_BULK',
    org_user_id: 'ouX8dwsbLCLv',
    creator_id: 'ouX8dwsbLCLv',
    txn_dt: new Date('2023-02-08T17:00:00.000Z'),
    vendor: null,
    platform_vendor: null,
    category: null,
    amount: null,
    currency: null,
    admin_amount: null,
    user_amount: null,
    orig_amount: null,
    orig_currency: null,
    tax: null,
    tax_amount: null,
    tax_group_id: null,
    report_id: null,
    reported_at: null,
    num_files: 0,
    invoice_number: null,
    purpose: null,
    vendor_id: null,
    platform_vendor_id: null,
    project_id: null,
    billable: null,
    skip_reimbursement: false,
    state: 'DRAFT',
    external_id: null,
    cost_center_id: null,
    payment_id: null,
    source_account_id: 'acc5APeygFjRd',
    org_category_id: 16582,
    physical_bill: null,
    policy_state: null,
    manual_flag: null,
    policy_flag: null,
    expense_number: 'E/2023/02/T/51',
    split_group_id: 'txNVtsqF8Siq',
    split_group_user_amount: null,
    extracted_data: null,
    mandatory_fields_present: false,
    user_reason_for_duplicate_expenses: null,
    distance: null,
    distance_unit: null,
    from_dt: null,
    to_dt: null,
    num_days: null,
    fyle_category: 'Unspecified',
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
    custom_properties: null,
    physical_bill_at: null,
    policy_amount: null,
    locations: [],
  },
];

export const expectedFormattedTransaction: Partial<Expense>[] = [
  {
    tx_created_at: new Date('2023-02-08T06:47:48.414Z'),
    tx_updated_at: new Date('2023-02-08T06:47:48.414Z'),
    tx_id: 'txNVtsqF8Siq',
    tx_source: 'MOBILE_DASHCAM_BULK',
    tx_org_user_id: 'ouX8dwsbLCLv',
    tx_creator_id: 'ouX8dwsbLCLv',
    tx_txn_dt: new Date('2023-02-08T17:00:00.000Z'),
    tx_vendor: null,
    tx_platform_vendor: null,
    tx_category: null,
    tx_amount: null,
    tx_currency: null,
    tx_admin_amount: null,
    tx_user_amount: null,
    tx_orig_amount: null,
    tx_orig_currency: null,
    tx_tax: null,
    tx_tax_amount: null,
    tx_tax_group_id: null,
    tx_report_id: null,
    tx_reported_at: null,
    tx_num_files: 0,
    tx_invoice_number: null,
    tx_purpose: null,
    tx_vendor_id: null,
    tx_platform_vendor_id: null,
    tx_project_id: null,
    tx_billable: null,
    tx_skip_reimbursement: false,
    tx_state: 'DRAFT',
    tx_external_id: null,
    tx_cost_center_id: null,
    tx_payment_id: null,
    tx_source_account_id: 'acc5APeygFjRd',
    tx_org_category_id: 16582,
    tx_physical_bill: null,
    tx_policy_state: null,
    tx_manual_flag: null,
    tx_policy_flag: null,
    tx_expense_number: 'E/2023/02/T/51',
    tx_split_group_id: 'txNVtsqF8Siq',
    tx_split_group_user_amount: null,
    tx_extracted_data: null,
    tx_mandatory_fields_present: false,
    tx_user_reason_for_duplicate_expenses: null,
    tx_distance: null,
    tx_distance_unit: null,
    tx_from_dt: null,
    tx_to_dt: null,
    tx_num_days: null,
    tx_fyle_category: 'Unspecified',
    tx_mileage_calculated_distance: null,
    tx_mileage_calculated_amount: null,
    tx_mileage_vehicle_type: null,
    tx_mileage_rate: null,
    tx_mileage_is_round_trip: null,
    tx_hotel_is_breakfast_provided: null,
    tx_flight_journey_travel_class: null,
    tx_flight_return_travel_class: null,
    tx_train_travel_class: null,
    tx_bus_travel_class: null,
    tx_taxi_travel_class: null,
    tx_per_diem_rate_id: null,
    tx_activity_policy_pending: null,
    tx_activity_details: null,
    tx_custom_properties: null,
    tx_physical_bill_at: null,
    tx_policy_amount: null,
    tx_locations: [],
  },
];

export const expectedActionSheetButtonRes = [
  {
    text: 'Capture Receipt',
    icon: 'assets/svg/fy-camera.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add Manually',
    icon: 'assets/svg/fy-expense.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add Mileage',
    icon: 'assets/svg/fy-mileage.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add Per Diem',
    icon: 'assets/svg/fy-calendar.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
];

export const expectedCurrentParams = {
  sortDir: 'asc',
  queryParams: {
    corporate_credit_card_account_number: 'in.(789)',
    and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
    or: ['(tx_is_split_expense.eq.true)'],
  },
};

export const modalControllerParams = {
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: [
      ...filterOptions1,
      {
        name: 'Cards',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'ABC',
            value: '1234',
          },
        ],
      },
    ],
    selectedFilterValues: selectedFilters1,
    activeFilterInitialName: 'approvalDate',
  },
  cssClass: 'dialog-popover',
};

export const modalControllerParams2 = {
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: filterOptions1,
    selectedFilterValues: selectedFilters1,
    activeFilterInitialName: 'approvalDate',
  },
  cssClass: 'dialog-popover',
};

export const expectedFilterPill3 = [
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Credit',
  },
];

export const expectedCriticalPolicyViolationPopoverParams = {
  title: `2 Critical Policy and \
              1 Draft Expenses blocking the way`,
  message: `Critical policy blocking these 2 expenses worth \
              $33700 from being submitted. \
              Also 1 other expenses are in draft states.`,
  reportType: 'newReport',
};

export const expectedCriticalPolicyViolationPopoverParams2 = {
  title: '2 Critical Policy Expenses blocking the way',
  message: `Critical policy blocking these 2 expenses worth \
              $33700 from being submitted.`,
  reportType: 'newReport',
};

export const expectedCriticalPolicyViolationPopoverParams3 = {
  title: '1 Draft Expenses blocking the way',
  message: '1 expenses are in draft states.',
  reportType: 'newReport',
};

export const modalDefaultPropertiesRes = {
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
};

export const newReportModalParams = {
  component: CreateNewReportComponent,
  componentProps: {
    selectedExpensesToReport: apiExpenseRes,
  },
  mode: <Mode>'ios',
  ...modalDefaultPropertiesRes,
};

export const addExpenseToReportModalParams = {
  component: AddTxnToReportDialogComponent,
  componentProps: {
    txId: '12345',
  },
  mode: <Mode>'ios',
  ...modalDefaultPropertiesRes,
};

export const snackbarPropertiesRes = {
  data: {
    icon: 'danger',
    showCloseButton: true,
    message: 'Please select one or more expenses to be reported',
  },
  duration: 3000,
};

export const snackbarPropertiesRes2 = {
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expense added to report successfully',
  },
  duration: 3000,
};

export const snackbarPropertiesRes3 = {
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '1 expense has been deleted',
  },
  duration: 3000,
};

export const snackbarPropertiesRes4 = {
  data: {
    icon: 'danger',
    showCloseButton: true,
    message: 'We could not delete the expenses. Please try again',
  },
  duration: 3000,
};
