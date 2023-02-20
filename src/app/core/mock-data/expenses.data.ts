import { Expense } from '../models/expense.model';

export const expensesWithDependentFields: Expense[] = [
  {
    corporate_credit_card_account_number: null,
    credit: false,
    debit: false,
    duplicates: [
      {
        fields: ['amount', 'currency', 'txn_dt'],
        percent: 33,
        reason: '(Accuracy rate: 33%) The amount, currency, date of spend of this expense match with another expense.',
        transaction_id: 'txCYDX0peUw5',
      },
    ],
    external_expense_id: null,
    matched_by: null,
    ou_band: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'ou7tV5isTkRl',
    ou_joining_dt: null,
    ou_level: null,
    ou_location: null,
    ou_mobile: null,
    ou_org_id: 'orOTDe765hQp',
    ou_org_name: "Yash's test organization",
    ou_rank: null,
    ou_sub_department: null,
    ou_title: null,
    ou_user_id: 'usrGrejHhlcy',
    rp_approved_at: null,
    rp_claim_number: null,
    rp_purpose: null,
    rp_reimbursed_at: null,
    source_account_id: 'acccaNcbxHLof',
    source_account_type: 'PERSONAL_ACCOUNT',
    tg_name: null,
    tg_percentage: null,
    transaction_approvals: null,
    tx_activity_details: null,
    tx_activity_policy_pending: null,
    tx_admin_amount: null,
    tx_amount: 123,
    tx_billable: false,
    tx_boolean_column1: false,
    tx_boolean_column10: null,
    tx_boolean_column2: null,
    tx_boolean_column3: null,
    tx_boolean_column4: null,
    tx_boolean_column5: null,
    tx_boolean_column6: null,
    tx_boolean_column7: null,
    tx_boolean_column8: null,
    tx_boolean_column9: null,
    tx_bus_travel_class: null,
    tx_category: null,
    tx_corporate_credit_card_expense_group_id: null,
    tx_cost_center_code: '123',
    tx_cost_center_id: 15818,
    tx_cost_center_name: '2qw3e',
    tx_created_at: new Date('2023-02-13T09:02:30.979559'),
    tx_creator_id: 'ou7tV5isTkRl',
    tx_currency: 'INR',
    tx_custom_properties: [
      {
        name: 'CF1',
        value: 'CF1.1',
      },
      {
        name: 'CF2',
        value: 'CF2.1',
      },
      {
        name: 'CF3',
        value: null,
      },
    ],
    tx_decimal_column1: null,
    tx_decimal_column10: null,
    tx_decimal_column2: null,
    tx_decimal_column3: null,
    tx_decimal_column4: null,
    tx_decimal_column5: null,
    tx_decimal_column6: null,
    tx_decimal_column7: null,
    tx_decimal_column8: null,
    tx_decimal_column9: null,
    tx_distance: null,
    tx_distance_unit: null,
    tx_expense_number: 'E/2023/02/T/26',
    tx_external_id: null,
    tx_extracted_data: null,
    tx_file_ids: null,
    tx_flight_journey_travel_class: null,
    tx_flight_return_travel_class: null,
    tx_from_dt: null,
    tx_fyle_category: null,
    tx_hotel_is_breakfast_provided: false,
    tx_id: 'txfCdl3TEZ7K',
    tx_invoice_number: null,
    tx_is_duplicate_expense: null,
    tx_is_holiday_expense: null,
    tx_is_implicit_merge_blocked: false,
    tx_is_split_expense: false,
    tx_location_column1: {
      actual: null,
      city: 'Teterboro',
      country: 'United States',
      display: 'EWR8 - Amazon Warehouse, Henry Street, Teterboro, NJ, USA',
      formatted_address: '32 Henry St, Teterboro, NJ 07608, USA',
      latitude: 40.8660875,
      longitude: -74.05936919999999,
      state: 'New Jersey',
    },
    tx_location_column10: null,
    tx_location_column2: null,
    tx_location_column3: null,
    tx_location_column4: null,
    tx_location_column5: null,
    tx_location_column6: null,
    tx_location_column7: null,
    tx_location_column8: null,
    tx_location_column9: null,
    tx_locations: [],
    tx_mandatory_fields_present: true,
    tx_manual_flag: false,
    tx_mileage_calculated_amount: null,
    tx_mileage_calculated_distance: null,
    tx_mileage_is_round_trip: null,
    tx_mileage_rate: null,
    tx_mileage_vehicle_type: null,
    tx_num_days: null,
    tx_num_files: 0,
    tx_org_category: '10',
    tx_org_category_code: 'C010',
    tx_org_category_id: 247980,
    tx_org_user_id: 'ou7tV5isTkRl',
    tx_orig_amount: null,
    tx_orig_currency: null,
    tx_payment_id: 'payjBSZoHCy05',
    tx_per_diem_rate_id: null,
    tx_physical_bill: false,
    tx_physical_bill_at: null,
    tx_policy_amount: null,
    tx_policy_flag: false,
    tx_policy_state: null,
    tx_project_code: 'P111',
    tx_project_id: 316992,
    tx_project_name: 'Project 111 / Sub 111',
    tx_purpose: 'werwerf',
    tx_receipt_required: null,
    tx_report_id: null,
    tx_reported_at: null,
    tx_risk_state: null,
    tx_skip_reimbursement: false,
    tx_source: 'WEBAPP',
    tx_source_account_id: 'acccaNcbxHLof',
    tx_split_group_id: 'txfCdl3TEZ7K',
    tx_split_group_user_amount: 123,
    tx_state: 'COMPLETE',
    tx_sub_category: '10',
    tx_tax: null,
    tx_tax_amount: null,
    tx_tax_group_id: null,
    tx_text_array_column1: ['dimple.kh@fyle.in', 'yash.s@fyle.in'],
    tx_text_array_column10: null,
    tx_text_array_column2: ['MF1', 'MF2'],
    tx_text_array_column3: null,
    tx_text_array_column4: null,
    tx_text_array_column5: null,
    tx_text_array_column6: null,
    tx_text_array_column7: null,
    tx_text_array_column8: null,
    tx_text_array_column9: null,
    tx_text_column1: null,
    tx_text_column10: 'CF3.1',
    tx_text_column11: 'CF4.1',
    tx_text_column12: 'CF5.1',
    tx_text_column13: 'Cv2',
    tx_text_column14: null,
    tx_text_column15: null,
    tx_text_column2: null,
    tx_text_column3: null,
    tx_text_column4: null,
    tx_text_column5: null,
    tx_text_column6: null,
    tx_text_column7: null,
    tx_text_column8: 'CF1.1',
    tx_text_column9: 'CF2.1',
    tx_timestamp_column1: '2023-02-07T06:30:00',
    tx_timestamp_column10: null,
    tx_timestamp_column2: null,
    tx_timestamp_column3: null,
    tx_timestamp_column4: null,
    tx_timestamp_column5: null,
    tx_timestamp_column6: null,
    tx_timestamp_column7: null,
    tx_timestamp_column8: null,
    tx_timestamp_column9: null,
    tx_to_dt: null,
    tx_train_travel_class: null,
    tx_transcribed_data: null,
    tx_transcription_state: null,
    tx_txn_dt: new Date('2023-02-13T01:00:00.000Z'),
    tx_updated_at: new Date('2023-02-13T09:02:31.582553'),
    tx_user_amount: 123,
    tx_user_can_delete: true,
    tx_user_reason_for_duplicate_expenses: null,
    tx_user_review_needed: null,
    tx_vendor: null,
    tx_vendor_id: null,
    tx_verification_state: null,
    us_email: 'yash.s@fyle.in',
    us_full_name: 'yash',
    isDraft: false,
    isPolicyViolated: false,
    isCriticalPolicyViolated: false,
    vendorDetails: null,
  },
  {
    corporate_credit_card_account_number: null,
    credit: false,
    debit: false,
    duplicates: [
      {
        fields: ['amount', 'currency', 'txn_dt'],
        percent: 33,
        reason: '(Accuracy rate: 33%) The amount, currency, date of spend of this expense match with another expense.',
        transaction_id: 'txfCdl3TEZ7K',
      },
    ],
    external_expense_id: null,
    matched_by: null,
    ou_band: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'ou7tV5isTkRl',
    ou_joining_dt: null,
    ou_level: null,
    ou_location: null,
    ou_mobile: null,
    ou_org_id: 'orOTDe765hQp',
    ou_org_name: "Yash's test organization",
    ou_rank: null,
    ou_sub_department: null,
    ou_title: null,
    ou_user_id: 'usrGrejHhlcy',
    rp_approved_at: null,
    rp_claim_number: null,
    rp_purpose: null,
    rp_reimbursed_at: null,
    source_account_id: 'acccaNcbxHLof',
    source_account_type: 'PERSONAL_ACCOUNT',
    tg_name: null,
    tg_percentage: null,
    transaction_approvals: null,
    tx_activity_details: null,
    tx_activity_policy_pending: null,
    tx_admin_amount: null,
    tx_amount: 123,
    tx_billable: false,
    tx_boolean_column1: false,
    tx_boolean_column10: null,
    tx_boolean_column2: null,
    tx_boolean_column3: null,
    tx_boolean_column4: null,
    tx_boolean_column5: null,
    tx_boolean_column6: null,
    tx_boolean_column7: null,
    tx_boolean_column8: null,
    tx_boolean_column9: null,
    tx_bus_travel_class: null,
    tx_category: null,
    tx_corporate_credit_card_expense_group_id: null,
    tx_cost_center_code: '123',
    tx_cost_center_id: 15818,
    tx_cost_center_name: '2qw3e',
    tx_created_at: new Date('2023-02-13T09:00:51.904058'),
    tx_creator_id: 'ou7tV5isTkRl',
    tx_currency: 'INR',
    tx_custom_properties: [
      {
        name: 'CF1',
        value: 'CF1.3',
      },
      {
        name: 'CF2',
        value: 'CF2.3',
      },
      {
        name: 'CF3',
        value: 'CF3.3',
      },
    ],
    tx_decimal_column1: null,
    tx_decimal_column10: null,
    tx_decimal_column2: null,
    tx_decimal_column3: null,
    tx_decimal_column4: null,
    tx_decimal_column5: null,
    tx_decimal_column6: null,
    tx_decimal_column7: null,
    tx_decimal_column8: null,
    tx_decimal_column9: null,
    tx_distance: null,
    tx_distance_unit: null,
    tx_expense_number: 'E/2023/02/T/25',
    tx_external_id: null,
    tx_extracted_data: null,
    tx_file_ids: null,
    tx_flight_journey_travel_class: null,
    tx_flight_return_travel_class: null,
    tx_from_dt: null,
    tx_fyle_category: null,
    tx_hotel_is_breakfast_provided: false,
    tx_id: 'txCYDX0peUw5',
    tx_invoice_number: null,
    tx_is_duplicate_expense: null,
    tx_is_holiday_expense: null,
    tx_is_implicit_merge_blocked: false,
    tx_is_split_expense: false,
    tx_location_column1: {
      actual: null,
      city: 'Rome',
      country: 'Italy',
      display: 'Testaccio, Rome, Metropolitan City of Rome Capital, Italy',
      formatted_address: 'Monte Testaccio, 00153 Rome, Metropolitan City of Rome Capital, Italy',
      latitude: 41.87595200000001,
      longitude: 12.475694,
      state: 'Lazio',
    },
    tx_location_column10: null,
    tx_location_column2: null,
    tx_location_column3: null,
    tx_location_column4: null,
    tx_location_column5: null,
    tx_location_column6: null,
    tx_location_column7: null,
    tx_location_column8: null,
    tx_location_column9: null,
    tx_locations: [],
    tx_mandatory_fields_present: true,
    tx_manual_flag: false,
    tx_mileage_calculated_amount: null,
    tx_mileage_calculated_distance: null,
    tx_mileage_is_round_trip: null,
    tx_mileage_rate: null,
    tx_mileage_vehicle_type: null,
    tx_num_days: null,
    tx_num_files: 0,
    tx_org_category: '10',
    tx_org_category_code: 'C010',
    tx_org_category_id: 247980,
    tx_org_user_id: 'ou7tV5isTkRl',
    tx_orig_amount: null,
    tx_orig_currency: null,
    tx_payment_id: 'payR8Q3X546o6',
    tx_per_diem_rate_id: null,
    tx_physical_bill: false,
    tx_physical_bill_at: null,
    tx_policy_amount: null,
    tx_policy_flag: false,
    tx_policy_state: null,
    tx_project_code: 'P27',
    tx_project_id: 316908,
    tx_project_name: 'Project 27 / Sub 27',
    tx_purpose: null,
    tx_receipt_required: null,
    tx_report_id: null,
    tx_reported_at: null,
    tx_risk_state: null,
    tx_skip_reimbursement: false,
    tx_source: 'WEBAPP',
    tx_source_account_id: 'acccaNcbxHLof',
    tx_split_group_id: 'txCYDX0peUw5',
    tx_split_group_user_amount: 123,
    tx_state: 'COMPLETE',
    tx_sub_category: '10',
    tx_tax: null,
    tx_tax_amount: null,
    tx_tax_group_id: null,
    tx_text_array_column1: ['dimple.kh@fyle.in'],
    tx_text_array_column10: null,
    tx_text_array_column2: ['MF2', 'MF3'],
    tx_text_array_column3: null,
    tx_text_array_column4: null,
    tx_text_array_column5: null,
    tx_text_array_column6: null,
    tx_text_array_column7: null,
    tx_text_array_column8: null,
    tx_text_array_column9: null,
    tx_text_column1: null,
    tx_text_column10: 'CF3.3',
    tx_text_column11: 'CF4.3',
    tx_text_column12: 'CF5.3',
    tx_text_column13: 'Cv2',
    tx_text_column14: null,
    tx_text_column15: null,
    tx_text_column2: null,
    tx_text_column3: null,
    tx_text_column4: null,
    tx_text_column5: null,
    tx_text_column6: null,
    tx_text_column7: null,
    tx_text_column8: 'CF1.3',
    tx_text_column9: 'CF2.3',
    tx_timestamp_column1: '2023-02-08T06:30:00',
    tx_timestamp_column10: null,
    tx_timestamp_column2: null,
    tx_timestamp_column3: null,
    tx_timestamp_column4: null,
    tx_timestamp_column5: null,
    tx_timestamp_column6: null,
    tx_timestamp_column7: null,
    tx_timestamp_column8: null,
    tx_timestamp_column9: null,
    tx_to_dt: null,
    tx_train_travel_class: null,
    tx_transcribed_data: null,
    tx_transcription_state: null,
    tx_txn_dt: new Date('2023-02-13T01:00:00.000Z'),
    tx_updated_at: new Date('2023-02-13T09:01:31.240963'),
    tx_user_amount: 123,
    tx_user_can_delete: true,
    tx_user_reason_for_duplicate_expenses: null,
    tx_user_review_needed: null,
    tx_vendor: '213',
    tx_vendor_id: 26599,
    tx_verification_state: null,
    us_email: 'yash.s@fyle.in',
    us_full_name: 'yash',
    isDraft: false,
    isPolicyViolated: false,
    isCriticalPolicyViolated: false,
    vendorDetails: '213',
  },
];

export const expensesWithSameProject: Expense[] = [
  {
    corporate_credit_card_account_number: null,
    credit: false,
    debit: false,
    duplicates: [
      {
        fields: ['amount', 'currency', 'txn_dt'],
        percent: 33,
        reason: '(Accuracy rate: 33%) The amount, currency, date of spend of this expense match with another expense.',
        transaction_id: 'txCYDX0peUw5',
      },
    ],
    external_expense_id: null,
    matched_by: null,
    ou_band: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'ou7tV5isTkRl',
    ou_joining_dt: null,
    ou_level: null,
    ou_location: null,
    ou_mobile: null,
    ou_org_id: 'orOTDe765hQp',
    ou_org_name: "Yash's test organization",
    ou_rank: null,
    ou_sub_department: null,
    ou_title: null,
    ou_user_id: 'usrGrejHhlcy',
    rp_approved_at: null,
    rp_claim_number: null,
    rp_purpose: null,
    rp_reimbursed_at: null,
    source_account_id: 'acccaNcbxHLof',
    source_account_type: 'PERSONAL_ACCOUNT',
    tg_name: null,
    tg_percentage: null,
    transaction_approvals: null,
    tx_activity_details: null,
    tx_activity_policy_pending: null,
    tx_admin_amount: null,
    tx_amount: 123,
    tx_billable: false,
    tx_boolean_column1: false,
    tx_boolean_column10: null,
    tx_boolean_column2: null,
    tx_boolean_column3: null,
    tx_boolean_column4: null,
    tx_boolean_column5: null,
    tx_boolean_column6: null,
    tx_boolean_column7: null,
    tx_boolean_column8: null,
    tx_boolean_column9: null,
    tx_bus_travel_class: null,
    tx_category: null,
    tx_corporate_credit_card_expense_group_id: null,
    tx_cost_center_code: '123',
    tx_cost_center_id: 15818,
    tx_cost_center_name: '2qw3e',
    tx_created_at: new Date('2023-02-13T09:02:30.979559'),
    tx_creator_id: 'ou7tV5isTkRl',
    tx_currency: 'INR',
    tx_custom_properties: [],
    tx_decimal_column1: null,
    tx_decimal_column10: null,
    tx_decimal_column2: null,
    tx_decimal_column3: null,
    tx_decimal_column4: null,
    tx_decimal_column5: null,
    tx_decimal_column6: null,
    tx_decimal_column7: null,
    tx_decimal_column8: null,
    tx_decimal_column9: null,
    tx_distance: null,
    tx_distance_unit: null,
    tx_expense_number: 'E/2023/02/T/26',
    tx_external_id: null,
    tx_extracted_data: null,
    tx_file_ids: null,
    tx_flight_journey_travel_class: null,
    tx_flight_return_travel_class: null,
    tx_from_dt: null,
    tx_fyle_category: null,
    tx_hotel_is_breakfast_provided: false,
    tx_id: 'txfCdl3TEZ7K',
    tx_invoice_number: null,
    tx_is_duplicate_expense: null,
    tx_is_holiday_expense: null,
    tx_is_implicit_merge_blocked: false,
    tx_is_split_expense: false,
    tx_location_column1: {
      actual: null,
      city: 'Teterboro',
      country: 'United States',
      display: 'EWR8 - Amazon Warehouse, Henry Street, Teterboro, NJ, USA',
      formatted_address: '32 Henry St, Teterboro, NJ 07608, USA',
      latitude: 40.8660875,
      longitude: -74.05936919999999,
      state: 'New Jersey',
    },
    tx_location_column10: null,
    tx_location_column2: null,
    tx_location_column3: null,
    tx_location_column4: null,
    tx_location_column5: null,
    tx_location_column6: null,
    tx_location_column7: null,
    tx_location_column8: null,
    tx_location_column9: null,
    tx_locations: [],
    tx_mandatory_fields_present: true,
    tx_manual_flag: false,
    tx_mileage_calculated_amount: null,
    tx_mileage_calculated_distance: null,
    tx_mileage_is_round_trip: null,
    tx_mileage_rate: null,
    tx_mileage_vehicle_type: null,
    tx_num_days: null,
    tx_num_files: 0,
    tx_org_category: '10',
    tx_org_category_code: 'C010',
    tx_org_category_id: 247980,
    tx_org_user_id: 'ou7tV5isTkRl',
    tx_orig_amount: null,
    tx_orig_currency: null,
    tx_payment_id: 'payjBSZoHCy05',
    tx_per_diem_rate_id: null,
    tx_physical_bill: false,
    tx_physical_bill_at: null,
    tx_policy_amount: null,
    tx_policy_flag: false,
    tx_policy_state: null,
    tx_project_code: 'P111',
    tx_project_id: 316992,
    tx_project_name: 'Project 111 / Sub 111',
    tx_purpose: 'werwerf',
    tx_receipt_required: null,
    tx_report_id: null,
    tx_reported_at: null,
    tx_risk_state: null,
    tx_skip_reimbursement: false,
    tx_source: 'WEBAPP',
    tx_source_account_id: 'acccaNcbxHLof',
    tx_split_group_id: 'txfCdl3TEZ7K',
    tx_split_group_user_amount: 123,
    tx_state: 'COMPLETE',
    tx_sub_category: '10',
    tx_tax: null,
    tx_tax_amount: null,
    tx_tax_group_id: null,
    tx_text_array_column1: ['dimple.kh@fyle.in', 'yash.s@fyle.in'],
    tx_text_array_column10: null,
    tx_text_array_column2: ['MF1', 'MF2'],
    tx_text_array_column3: null,
    tx_text_array_column4: null,
    tx_text_array_column5: null,
    tx_text_array_column6: null,
    tx_text_array_column7: null,
    tx_text_array_column8: null,
    tx_text_array_column9: null,
    tx_text_column1: null,
    tx_text_column10: 'CF3.1',
    tx_text_column11: 'CF4.1',
    tx_text_column12: 'CF5.1',
    tx_text_column13: 'Cv2',
    tx_text_column14: null,
    tx_text_column15: null,
    tx_text_column2: null,
    tx_text_column3: null,
    tx_text_column4: null,
    tx_text_column5: null,
    tx_text_column6: null,
    tx_text_column7: null,
    tx_text_column8: 'CF1.1',
    tx_text_column9: 'CF2.1',
    tx_timestamp_column1: '2023-02-07T06:30:00',
    tx_timestamp_column10: null,
    tx_timestamp_column2: null,
    tx_timestamp_column3: null,
    tx_timestamp_column4: null,
    tx_timestamp_column5: null,
    tx_timestamp_column6: null,
    tx_timestamp_column7: null,
    tx_timestamp_column8: null,
    tx_timestamp_column9: null,
    tx_to_dt: null,
    tx_train_travel_class: null,
    tx_transcribed_data: null,
    tx_transcription_state: null,
    tx_txn_dt: new Date('2023-02-13T01:00:00.000Z'),
    tx_updated_at: new Date('2023-02-13T09:02:31.582553'),
    tx_user_amount: 123,
    tx_user_can_delete: true,
    tx_user_reason_for_duplicate_expenses: null,
    tx_user_review_needed: null,
    tx_vendor: null,
    tx_vendor_id: null,
    tx_verification_state: null,
    us_email: 'yash.s@fyle.in',
    us_full_name: 'yash',
    isDraft: false,
    isPolicyViolated: false,
    isCriticalPolicyViolated: false,
    vendorDetails: null,
  },
  {
    corporate_credit_card_account_number: null,
    credit: false,
    debit: false,
    duplicates: [
      {
        fields: ['amount', 'currency', 'txn_dt'],
        percent: 33,
        reason: '(Accuracy rate: 33%) The amount, currency, date of spend of this expense match with another expense.',
        transaction_id: 'txfCdl3TEZ7K',
      },
    ],
    external_expense_id: null,
    matched_by: null,
    ou_band: null,
    ou_business_unit: null,
    ou_department: null,
    ou_department_id: null,
    ou_employee_id: null,
    ou_id: 'ou7tV5isTkRl',
    ou_joining_dt: null,
    ou_level: null,
    ou_location: null,
    ou_mobile: null,
    ou_org_id: 'orOTDe765hQp',
    ou_org_name: "Yash's test organization",
    ou_rank: null,
    ou_sub_department: null,
    ou_title: null,
    ou_user_id: 'usrGrejHhlcy',
    rp_approved_at: null,
    rp_claim_number: null,
    rp_purpose: null,
    rp_reimbursed_at: null,
    source_account_id: 'acccaNcbxHLof',
    source_account_type: 'PERSONAL_ACCOUNT',
    tg_name: null,
    tg_percentage: null,
    transaction_approvals: null,
    tx_activity_details: null,
    tx_activity_policy_pending: null,
    tx_admin_amount: null,
    tx_amount: 123,
    tx_billable: false,
    tx_boolean_column1: false,
    tx_boolean_column10: null,
    tx_boolean_column2: null,
    tx_boolean_column3: null,
    tx_boolean_column4: null,
    tx_boolean_column5: null,
    tx_boolean_column6: null,
    tx_boolean_column7: null,
    tx_boolean_column8: null,
    tx_boolean_column9: null,
    tx_bus_travel_class: null,
    tx_category: null,
    tx_corporate_credit_card_expense_group_id: null,
    tx_cost_center_code: '123',
    tx_cost_center_id: 15818,
    tx_cost_center_name: '2qw3e',
    tx_created_at: new Date('2023-02-13T09:00:51.904058'),
    tx_creator_id: 'ou7tV5isTkRl',
    tx_currency: 'INR',
    tx_custom_properties: [
      {
        name: 'CF1',
        value: 'CF1.3',
      },
      {
        name: 'CF2',
        value: 'CF2.3',
      },
      {
        name: 'CF3',
        value: 'CF3.3',
      },
    ],
    tx_decimal_column1: null,
    tx_decimal_column10: null,
    tx_decimal_column2: null,
    tx_decimal_column3: null,
    tx_decimal_column4: null,
    tx_decimal_column5: null,
    tx_decimal_column6: null,
    tx_decimal_column7: null,
    tx_decimal_column8: null,
    tx_decimal_column9: null,
    tx_distance: null,
    tx_distance_unit: null,
    tx_expense_number: 'E/2023/02/T/25',
    tx_external_id: null,
    tx_extracted_data: null,
    tx_file_ids: null,
    tx_flight_journey_travel_class: null,
    tx_flight_return_travel_class: null,
    tx_from_dt: null,
    tx_fyle_category: null,
    tx_hotel_is_breakfast_provided: false,
    tx_id: 'txCYDX0peUw5',
    tx_invoice_number: null,
    tx_is_duplicate_expense: null,
    tx_is_holiday_expense: null,
    tx_is_implicit_merge_blocked: false,
    tx_is_split_expense: false,
    tx_location_column1: {
      actual: null,
      city: 'Rome',
      country: 'Italy',
      display: 'Testaccio, Rome, Metropolitan City of Rome Capital, Italy',
      formatted_address: 'Monte Testaccio, 00153 Rome, Metropolitan City of Rome Capital, Italy',
      latitude: 41.87595200000001,
      longitude: 12.475694,
      state: 'Lazio',
    },
    tx_location_column10: null,
    tx_location_column2: null,
    tx_location_column3: null,
    tx_location_column4: null,
    tx_location_column5: null,
    tx_location_column6: null,
    tx_location_column7: null,
    tx_location_column8: null,
    tx_location_column9: null,
    tx_locations: [],
    tx_mandatory_fields_present: true,
    tx_manual_flag: false,
    tx_mileage_calculated_amount: null,
    tx_mileage_calculated_distance: null,
    tx_mileage_is_round_trip: null,
    tx_mileage_rate: null,
    tx_mileage_vehicle_type: null,
    tx_num_days: null,
    tx_num_files: 0,
    tx_org_category: '10',
    tx_org_category_code: 'C010',
    tx_org_category_id: 247980,
    tx_org_user_id: 'ou7tV5isTkRl',
    tx_orig_amount: null,
    tx_orig_currency: null,
    tx_payment_id: 'payR8Q3X546o6',
    tx_per_diem_rate_id: null,
    tx_physical_bill: false,
    tx_physical_bill_at: null,
    tx_policy_amount: null,
    tx_policy_flag: false,
    tx_policy_state: null,
    tx_project_code: 'P111',
    tx_project_id: 316992,
    tx_project_name: 'Project 111 / Sub 111',
    tx_purpose: null,
    tx_receipt_required: null,
    tx_report_id: null,
    tx_reported_at: null,
    tx_risk_state: null,
    tx_skip_reimbursement: false,
    tx_source: 'WEBAPP',
    tx_source_account_id: 'acccaNcbxHLof',
    tx_split_group_id: 'txCYDX0peUw5',
    tx_split_group_user_amount: 123,
    tx_state: 'COMPLETE',
    tx_sub_category: '10',
    tx_tax: null,
    tx_tax_amount: null,
    tx_tax_group_id: null,
    tx_text_array_column1: ['dimple.kh@fyle.in'],
    tx_text_array_column10: null,
    tx_text_array_column2: ['MF2', 'MF3'],
    tx_text_array_column3: null,
    tx_text_array_column4: null,
    tx_text_array_column5: null,
    tx_text_array_column6: null,
    tx_text_array_column7: null,
    tx_text_array_column8: null,
    tx_text_array_column9: null,
    tx_text_column1: null,
    tx_text_column10: 'CF3.3',
    tx_text_column11: 'CF4.3',
    tx_text_column12: 'CF5.3',
    tx_text_column13: 'Cv2',
    tx_text_column14: null,
    tx_text_column15: null,
    tx_text_column2: null,
    tx_text_column3: null,
    tx_text_column4: null,
    tx_text_column5: null,
    tx_text_column6: null,
    tx_text_column7: null,
    tx_text_column8: 'CF1.3',
    tx_text_column9: 'CF2.3',
    tx_timestamp_column1: '2023-02-08T06:30:00',
    tx_timestamp_column10: null,
    tx_timestamp_column2: null,
    tx_timestamp_column3: null,
    tx_timestamp_column4: null,
    tx_timestamp_column5: null,
    tx_timestamp_column6: null,
    tx_timestamp_column7: null,
    tx_timestamp_column8: null,
    tx_timestamp_column9: null,
    tx_to_dt: null,
    tx_train_travel_class: null,
    tx_transcribed_data: null,
    tx_transcription_state: null,
    tx_txn_dt: new Date('2023-02-13T01:00:00.000Z'),
    tx_updated_at: new Date('2023-02-13T09:01:31.240963'),
    tx_user_amount: 123,
    tx_user_can_delete: true,
    tx_user_reason_for_duplicate_expenses: null,
    tx_user_review_needed: null,
    tx_vendor: '213',
    tx_vendor_id: 26599,
    tx_verification_state: null,
    us_email: 'yash.s@fyle.in',
    us_full_name: 'yash',
    isDraft: false,
    isPolicyViolated: false,
    isCriticalPolicyViolated: false,
    vendorDetails: '213',
  },
];
