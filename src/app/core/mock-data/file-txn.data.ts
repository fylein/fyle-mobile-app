import { FileTransaction } from '../models/file-txn.model';
import {
  splitExpenseTxn1,
  splitExpenseTxn1_1,
  splitExpenseTxn2,
  splitExpenseTxn2_2,
  splitExpenseTxn2_3,
} from './transaction.data';

export const fileTxns: FileTransaction = {
  txns: [
    {
      created_at: new Date('2023-03-02T14:13:16.734Z'),
      updated_at: new Date('2023-03-02T14:13:16.734Z'),
      id: 'txB9uUczgwgO',
      source: 'MOBILE',
      org_user_id: 'ouX8dwsbLCLv',
      creator_id: 'ouX8dwsbLCLv',
      txn_dt: new Date('2023-03-02T17:00:00.000Z'),
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: 120,
      currency: 'INR',
      admin_amount: null,
      user_amount: 120,
      orig_amount: null,
      orig_currency: null,
      tax: 18.304799999999997,
      tax_amount: 18.304799999999997,
      tax_group_id: 'tg3iWuqWhfzB',
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: 'test_term (2) (1)',
      vendor_id: 28828,
      platform_vendor_id: null,
      project_id: 3943,
      billable: null,
      skip_reimbursement: true,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: 13793,
      payment_id: null,
      source_account_id: 'acc5APeygFjRd',
      org_category_id: 110351,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: false,
      expense_number: 'E/2023/03/T/34',
      split_group_id: 'txxkBruL0EO9',
      split_group_user_amount: 500,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Entertainment',
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
      custom_properties: [
        {
          name: 'userlist',
          value: [],
        },
        {
          name: 'User List',
          value: [],
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
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    {
      created_at: new Date('2023-03-02T14:13:16.811Z'),
      updated_at: new Date('2023-03-02T14:13:16.811Z'),
      id: 'txnumQykfO9h',
      source: 'MOBILE',
      org_user_id: 'ouX8dwsbLCLv',
      creator_id: 'ouX8dwsbLCLv',
      txn_dt: new Date('2023-03-02T17:00:00.000Z'),
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: 80,
      currency: 'INR',
      admin_amount: null,
      user_amount: 80,
      orig_amount: null,
      orig_currency: null,
      tax: 12.203199999999997,
      tax_amount: 12.203199999999997,
      tax_group_id: 'tg3iWuqWhfzB',
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: 'test_term (2) (2)',
      vendor_id: 28828,
      platform_vendor_id: null,
      project_id: 3943,
      billable: null,
      skip_reimbursement: true,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: 13793,
      payment_id: null,
      source_account_id: 'acc5APeygFjRd',
      org_category_id: 110351,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: false,
      expense_number: 'E/2023/03/T/35',
      split_group_id: 'txxkBruL0EO9',
      split_group_user_amount: 500,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Entertainment',
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
      custom_properties: [
        {
          name: 'userlist',
          value: [],
        },
        {
          name: 'User List',
          value: [],
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
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
  ],
  files: [
    {
      id: 'fic2q7DLgysQ',
      name: '000.jpeg',
      content: 'some content here',
    },
  ],
};

export const fileTxns2: FileTransaction = {
  txns: [
    {
      created_at: new Date('2023-06-16T05:37:30.878Z'),
      updated_at: new Date('2023-06-16T05:37:32.174Z'),
      id: 'txcY30CE86SZ',
      source: 'MOBILE_DASHCAM_SINGLE',
      org_user_id: 'ou5tyO64Eg0L',
      creator_id: 'ou5tyO64Eg0L',
      txn_dt: new Date('2023-05-06T06:30:00.000Z'),
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: 261805.478,
      currency: 'INR',
      admin_amount: null,
      user_amount: 261805.478,
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
      vendor_id: 26523,
      platform_vendor_id: null,
      project_id: null,
      billable: false,
      skip_reimbursement: false,
      state: 'COMPLETE',
      external_id: null,
      cost_center_id: null,
      payment_id: 'payjFVqLY3dJs',
      source_account_id: 'accdSPGRiSiZd',
      org_category_id: 161531,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2023/06/T/24',
      split_group_id: 'txPazncEIY9Q',
      split_group_user_amount: 174536.986,
      extracted_data: {
        amount: null,
        currency: 'INR',
        category: 'Others',
        date: null,
        vendor: null,
        invoice_dt: null,
      },
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: true,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Bus',
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
      custom_properties: [],
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    {
      created_at: new Date('2023-06-16T05:37:30.934Z'),
      updated_at: new Date('2023-06-16T05:37:31.902Z'),
      id: 'txCBiN0OW3zE',
      source: 'MOBILE_DASHCAM_SINGLE',
      org_user_id: 'ou5tyO64Eg0L',
      creator_id: 'ou5tyO64Eg0L',
      txn_dt: new Date('2023-05-06T06:30:00.000Z'),
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: 174536.986,
      currency: 'INR',
      admin_amount: null,
      user_amount: 174536.986,
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
      vendor_id: 26523,
      platform_vendor_id: null,
      project_id: null,
      billable: false,
      skip_reimbursement: false,
      state: 'COMPLETE',
      external_id: null,
      cost_center_id: null,
      payment_id: 'paymreZ0AAVPc',
      source_account_id: 'accdSPGRiSiZd',
      org_category_id: 161531,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2023/06/T/25',
      split_group_id: 'txPazncEIY9Q',
      split_group_user_amount: 174536.986,
      extracted_data: {
        amount: null,
        currency: 'INR',
        category: 'Others',
        date: null,
        vendor: null,
        invoice_dt: null,
      },
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: true,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Bus',
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
      custom_properties: [],
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
  ],
  files: [
    {
      id: 'fiI9e9ZytdXM',
      name: '000.jpeg',
      content: 'someData',
    },
  ],
};

export const fileTxns3: FileTransaction = {
  txns: [splitExpenseTxn1, { ...splitExpenseTxn1_1, id: 'tx12SqYytrm' }],
  files: [
    {
      id: 'fiI9e9ZytdXM',
      name: '000.jpeg',
      content: 'someData',
    },
  ],
};

export const fileTxns4: FileTransaction = {
  txns: [{ ...splitExpenseTxn1 }, { ...splitExpenseTxn1_1, id: 'tx12SqYytrm' }],
};

export const fileTxns5: FileTransaction = {
  txns: [
    { ...splitExpenseTxn2 },
    { ...splitExpenseTxn2_2, id: 'tx78mWdbfw1N' },
    { ...splitExpenseTxn2_3, id: 'txwyRuUnVCbo' },
  ],
  files: [
    {
      id: 'fizBwnXhyZTp',
      name: '000.jpeg',
      content: 'someContent',
    },
  ],
};

export const fileTxns6: FileTransaction = {
  txns: [
    { ...splitExpenseTxn2 },
    { ...splitExpenseTxn2_2, id: 'tx78mWdbfw1N' },
    { ...splitExpenseTxn2_3, id: 'txwyRuUnVCbo' },
  ],
  files: [
    {
      id: 'fiI9e9ZytdXM',
      name: '000.jpeg',
      content: 'someData',
    },
  ],
};

export const fileTxns7: FileTransaction = {
  txns: [
    {
      created_at: new Date('2023-06-22T04:13:28.899Z'),
      updated_at: new Date('2023-06-22T04:13:28.899Z'),
      id: 'tx5qtWJTXRcj',
      source: 'MOBILE',
      org_user_id: 'oudmNnyXjIgs',
      creator_id: 'oudmNnyXjIgs',
      txn_dt: new Date('2023-05-09T06:30:00.000Z'),
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: 381,
      currency: 'INR',
      admin_amount: null,
      user_amount: 381,
      orig_amount: null,
      orig_currency: null,
      tax: 0,
      tax_amount: 0,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: 148345,
      billable: null,
      skip_reimbursement: false,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: 4735,
      payment_id: null,
      source_account_id: 'acciPcZfp7j6o',
      org_category_id: 81820,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2023/06/T/11',
      split_group_id: 'txQfKDtvIcZk',
      split_group_user_amount: 635,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Bus',
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
      custom_properties: [
        {
          name: 'userlist test',
          value: [],
        },
        {
          name: 'tettest',
          value: null,
        },
        {
          name: 'select type field',
          value: null,
        },
      ],
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    {
      created_at: new Date('2023-06-22T04:13:28.948Z'),
      updated_at: new Date('2023-06-22T04:13:30.302Z'),
      id: 'txegSZ66da1T',
      source: 'MOBILE',
      org_user_id: 'oudmNnyXjIgs',
      creator_id: 'oudmNnyXjIgs',
      txn_dt: new Date('2023-05-09T06:30:00.000Z'),
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: 254,
      currency: 'INR',
      admin_amount: null,
      user_amount: 254,
      orig_amount: null,
      orig_currency: null,
      tax: 0,
      tax_amount: 0,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: 148345,
      billable: null,
      skip_reimbursement: false,
      state: 'COMPLETE',
      external_id: null,
      cost_center_id: 4735,
      payment_id: 'pay4gCCmBlVOL',
      source_account_id: 'acciPcZfp7j6o',
      org_category_id: 81823,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2023/06/T/12',
      split_group_id: 'txQfKDtvIcZk',
      split_group_user_amount: 635,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: true,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Bus',
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
      custom_properties: [
        {
          name: 'userlist test',
          value: [],
        },
        {
          name: 'tettest',
          value: null,
        },
        {
          name: 'select type field',
          value: null,
        },
      ],
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
  ],
};
