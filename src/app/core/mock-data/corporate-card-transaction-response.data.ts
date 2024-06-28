import deepFreeze from 'deep-freeze-strict';

import { CorporateCardTransactionRes } from '../models/platform/v1/corporate-card-transaction-res.model';
import { TransactionStatus } from '../models/platform/v1/expense.model';

export const ccTransactionResponseData: CorporateCardTransactionRes = deepFreeze({
  data: [
    {
      amount: 205.21,
      assignor_user: null,
      assignor_user_id: null,
      auto_suggested_expense_ids: [],
      can_delete: false,
      category: null,
      code: '6c4a6dcb15a94c0e976dcd1a507dcfd0',
      corporate_card: {
        bank_name: 'DSR',
        card_number: '7620',
        id: 'bacck9WlgA11Uh',
        masked_number: '7620',
        user_email: 'devendra.r@fyle.in',
        user_full_name: 'Devendra Singh Rana',
      },
      corporate_card_id: 'bacck9WlgA11Uh',
      created_at: '2024-01-23T12:17:34.473632+00:00',
      currency: 'USD',
      description: null,
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxnBdS2Kpvzhy',
      is_assigned: true,
      is_auto_matched: true,
      is_dismissed: false,
      is_exported: false,
      is_marked_personal: true,
      last_assigned_at: new Date('2024-01-23T12:18:51.470532+00:00'),
      last_auto_matched_at: new Date('2024-01-23T12:20:06.279340+00:00'),
      last_dismissed_at: null,
      last_marked_personal_at: new Date('2024-02-12T12:36:16.437731+00:00'),
      last_user_matched_at: null,
      matched_expense_ids: [],
      matched_expenses: [],
      mcc: null,
      merchant: 'test description',
      metadata: {
        merchant_category_code: '',
        flight_merchant_category_code: '',
        flight_supplier_name: '',
        flight_travel_agency_name: '',
        flight_ticket_number: '',
        flight_total_fare: 0,
        flight_travel_date: undefined,
        flight_service_class: '',
        flight_carrier_code: '',
        flight_fare_base_code: '',
        flight_trip_leg_number: '',
        hotel_merchant_category_code: '',
        hotel_supplier_name: '',
        hotel_checked_in_at: undefined,
        hotel_nights: 0,
        hotel_checked_out_at: undefined,
        hotel_country: '',
        hotel_city: '',
        hotel_total_fare: 0,
        fleet_product_merchant_category_code: '',
        fleet_product_supplier_name: '',
        fleet_service_merchant_category_code: '',
        fleet_service_supplier_name: '',
        car_rental_merchant_category_code: '',
        car_rental_supplier_name: '',
        car_rental_started_at: undefined,
        car_rental_days: 0,
        car_rental_ended_at: undefined,
        general_ticket_issued_at: undefined,
        general_ticket_number: '',
        general_issuing_carrier: '',
        general_travel_agency_name: '',
        general_travel_agency_code: '',
        general_ticket_total_fare: 0,
        general_ticket_total_tax: 0,
        merchant_address: '',
      },
      org_id: 'oroLKHBYQVvj',
      post_date: null,
      spent_at: '2018-06-06T00:00:00+00:00',
      statement_id: 'stmt2K9aLunGU4',
      updated_at: '2024-02-12T12:36:16.437742+00:00',
      user: {
        email: 'devendra.r@fyle.in',
        full_name: 'Devendra Singh Rana',
        id: 'usvMoPfCC9Xw',
      },
      user_id: 'usvMoPfCC9Xw',
    },
  ],
});

export const ccTransactionResponseData1: CorporateCardTransactionRes = deepFreeze({
  data: [
    {
      ...ccTransactionResponseData.data[0],
      id: 'btxnSte7sVQCM8',
    },
  ],
});

export const ccTransactionResponseData2: CorporateCardTransactionRes = deepFreeze({
  data: [
    {
      ...ccTransactionResponseData.data[0],
      corporate_card: {
        ...ccTransactionResponseData.data[0].corporate_card,
        nickname: 'Business Card',
      },
    },
  ],
});

export const unmatchCCCExpenseResponseData: CorporateCardTransactionRes = deepFreeze({
  data: [
    {
      amount: 260.37,
      assignor_user: null,
      assignor_user_id: null,
      auto_suggested_expense_ids: [],
      can_delete: true,
      category: null,
      code: 'b1d89f85d1f44a22981e4b4c8b1af435',
      corporate_card: {
        bank_name: 'DSR',
        card_number: '7620',
        id: 'bacck9WlgA11Uh',
        masked_number: '7620',
        user_email: 'devendra.r@fyle.in',
        user_full_name: 'Devendra Singh Rana',
      },
      corporate_card_id: 'bacck9WlgA11Uh',
      created_at: '2024-01-23T12:17:31.316675+00:00',
      currency: 'USD',
      description: null,
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxnSte7sVQCM8',
      is_assigned: true,
      is_auto_matched: false,
      is_dismissed: false,
      is_exported: false,
      is_marked_personal: false,
      last_assigned_at: new Date('2024-01-23T12:18:51.470532+00:00'),
      last_auto_matched_at: new Date('2024-01-23T12:19:50.298547+00:00'),
      last_dismissed_at: null,
      last_marked_personal_at: null,
      last_user_matched_at: new Date('2024-02-13T03:10:49.432011+00:00'),
      matched_expense_ids: ['txmF3wgfj0Bs'],
      matched_expenses: [
        {
          amount: 260.37,
          category_display_name: 'Unspecified',
          currency: 'USD',
          foreign_amount: null,
          foreign_currency: null,
          id: 'txmF3wgfj0Bs',
          merchant: 'test description',
          no_of_files: 0,
          purpose: null,
          seq_num: 'E/2024/01/T/39',
          spent_at: new Date('2018-07-04T00:00:00+00:00'),
          state: 'DRAFT',
        },
      ],
      mcc: null,
      merchant: 'test description',
      metadata: {
        merchant_category_code: '',
        flight_merchant_category_code: '',
        flight_supplier_name: '',
        flight_travel_agency_name: '',
        flight_ticket_number: '',
        flight_total_fare: 0,
        flight_travel_date: undefined,
        flight_service_class: '',
        flight_carrier_code: '',
        flight_fare_base_code: '',
        flight_trip_leg_number: '',
        hotel_merchant_category_code: '',
        hotel_supplier_name: '',
        hotel_checked_in_at: undefined,
        hotel_nights: 0,
        hotel_checked_out_at: undefined,
        hotel_country: '',
        hotel_city: '',
        hotel_total_fare: 0,
        fleet_product_merchant_category_code: '',
        fleet_product_supplier_name: '',
        fleet_service_merchant_category_code: '',
        fleet_service_supplier_name: '',
        car_rental_merchant_category_code: '',
        car_rental_supplier_name: '',
        car_rental_started_at: undefined,
        car_rental_days: 0,
        car_rental_ended_at: undefined,
        general_ticket_issued_at: undefined,
        general_ticket_number: '',
        general_issuing_carrier: '',
        general_travel_agency_name: '',
        general_travel_agency_code: '',
        general_ticket_total_fare: 0,
        general_ticket_total_tax: 0,
        merchant_address: '',
      },
      org_id: 'oroLKHBYQVvj',
      post_date: null,
      spent_at: '2018-07-04T00:00:00+00:00',
      statement_id: 'stmt2K9aLunGU4',
      transaction_status: TransactionStatus.PENDING,
      updated_at: '2024-02-13T03:10:49.432028+00:00',
      user: {
        email: 'devendra.r@fyle.in',
        full_name: 'Devendra Singh Rana',
        id: 'usvMoPfCC9Xw',
      },
      user_id: 'usvMoPfCC9Xw',
    },
  ],
});

export const matchCCCExpenseResponseData: CorporateCardTransactionRes = deepFreeze({
  data: [
    {
      amount: 260.37,
      assignor_user: null,
      assignor_user_id: null,
      auto_suggested_expense_ids: [],
      can_delete: true,
      category: null,
      code: 'b1d89f85d1f44a22981e4b4c8b1af435',
      corporate_card: {
        bank_name: 'DSR',
        card_number: '7620',
        id: 'bacck9WlgA11Uh',
        masked_number: '7620',
        user_email: 'devendra.r@fyle.in',
        user_full_name: 'Devendra Singh Rana',
      },
      corporate_card_id: 'bacck9WlgA11Uh',
      created_at: '2024-01-23T12:17:31.316675+00:00',
      currency: 'USD',
      description: null,
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxnSte7sVQCM8',
      is_assigned: true,
      is_auto_matched: true,
      is_dismissed: false,
      is_exported: false,
      is_marked_personal: false,
      last_assigned_at: new Date('2024-01-23T12:18:51.470532+00:00'),
      last_auto_matched_at: new Date('2024-01-23T12:19:50.298547+00:00'),
      last_dismissed_at: null,
      last_marked_personal_at: null,
      last_user_matched_at: null,
      matched_expense_ids: [],
      matched_expenses: [],
      mcc: null,
      merchant: 'test description',
      org_id: 'oroLKHBYQVvj',
      post_date: null,
      spent_at: '2018-07-04T00:00:00+00:00',
      statement_id: 'stmt2K9aLunGU4',
      transaction_status: TransactionStatus.PENDING,
      updated_at: '2024-02-13T03:10:48.454767+00:00',
      user: {
        email: 'devendra.r@fyle.in',
        full_name: 'Devendra Singh Rana',
        id: 'usvMoPfCC9Xw',
      },
      user_id: 'usvMoPfCC9Xw',
    },
  ],
});

export const ccTransactionResponseData3: CorporateCardTransactionRes = deepFreeze({
  data: [
    {
      amount: 205.21,
      assignor_user: null,
      assignor_user_id: null,
      auto_suggested_expense_ids: [],
      can_delete: false,
      category: null,
      code: '6c4a6dcb15a94c0e976dcd1a507dcfd0',
      corporate_card: {
        bank_name: 'DSR',
        card_number: '7620',
        id: 'bacck9WlgA11Uh',
        masked_number: '7620',
        user_email: 'devendra.r@fyle.in',
        user_full_name: 'Devendra Singh Rana',
      },
      corporate_card_id: 'bacck9WlgA11Uh',
      created_at: '2024-01-23T12:17:34.473632+00:00',
      currency: 'USD',
      description: null,
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxn7DbV1VYnmT',
      is_assigned: true,
      is_auto_matched: true,
      is_dismissed: false,
      is_exported: false,
      is_marked_personal: true,
      last_assigned_at: new Date('2024-01-23T12:18:51.470532+00:00'),
      last_auto_matched_at: new Date('2024-01-23T12:20:06.279340+00:00'),
      last_dismissed_at: null,
      last_marked_personal_at: new Date('2024-02-12T12:36:16.437731+00:00'),
      last_user_matched_at: null,
      matched_expense_ids: [],
      matched_expenses: [],
      mcc: null,
      merchant: 'test description',
      metadata: {
        merchant_category_code: '',
        flight_merchant_category_code: '',
        flight_supplier_name: '',
        flight_travel_agency_name: '',
        flight_ticket_number: '',
        flight_total_fare: 0,
        flight_travel_date: undefined,
        flight_service_class: '',
        flight_carrier_code: '',
        flight_fare_base_code: '',
        flight_trip_leg_number: '',
        hotel_merchant_category_code: '',
        hotel_supplier_name: '',
        hotel_checked_in_at: undefined,
        hotel_nights: 0,
        hotel_checked_out_at: undefined,
        hotel_country: '',
        hotel_city: '',
        hotel_total_fare: 0,
        fleet_product_merchant_category_code: '',
        fleet_product_supplier_name: '',
        fleet_service_merchant_category_code: '',
        fleet_service_supplier_name: '',
        car_rental_merchant_category_code: '',
        car_rental_supplier_name: '',
        car_rental_started_at: undefined,
        car_rental_days: 0,
        car_rental_ended_at: undefined,
        general_ticket_issued_at: undefined,
        general_ticket_number: '',
        general_issuing_carrier: '',
        general_travel_agency_name: '',
        general_travel_agency_code: '',
        general_ticket_total_fare: 0,
        general_ticket_total_tax: 0,
        merchant_address: '',
      },
      org_id: 'oroLKHBYQVvj',
      post_date: null,
      spent_at: '2018-06-06T00:00:00+00:00',
      statement_id: 'stmt2K9aLunGU4',
      updated_at: '2024-02-12T12:36:16.437742+00:00',
      user: {
        email: 'devendra.r@fyle.in',
        full_name: 'Devendra Singh Rana',
        id: 'usvMoPfCC9Xw',
      },
      user_id: 'usvMoPfCC9Xw',
      transaction_status: TransactionStatus.POSTED,
    },
    {
      amount: 205.21,
      assignor_user: null,
      assignor_user_id: null,
      auto_suggested_expense_ids: [],
      can_delete: false,
      category: null,
      code: '6c4a6dcb15a94c0e976dcd1a507dcfd0',
      corporate_card: {
        bank_name: 'DSR',
        card_number: '7620',
        id: 'bacck9WlgA11Uh',
        masked_number: '7620',
        user_email: 'devendra.r@fyle.in',
        user_full_name: 'Devendra Singh Rana',
      },
      corporate_card_id: 'bacck9WlgA11Uh',
      created_at: '2024-01-23T12:17:34.473632+00:00',
      currency: 'USD',
      description: null,
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxnBdS2Kpvzhy',
      is_assigned: true,
      is_auto_matched: true,
      is_dismissed: false,
      is_exported: false,
      is_marked_personal: true,
      last_assigned_at: new Date('2024-01-23T12:18:51.470532+00:00'),
      last_auto_matched_at: new Date('2024-01-23T12:20:06.279340+00:00'),
      last_dismissed_at: null,
      last_marked_personal_at: new Date('2024-02-12T12:36:16.437731+00:00'),
      last_user_matched_at: null,
      matched_expense_ids: [],
      matched_expenses: [],
      mcc: null,
      merchant: 'test description',
      metadata: {
        merchant_category_code: '',
        flight_merchant_category_code: '',
        flight_supplier_name: '',
        flight_travel_agency_name: '',
        flight_ticket_number: '',
        flight_total_fare: 0,
        flight_travel_date: undefined,
        flight_service_class: '',
        flight_carrier_code: '',
        flight_fare_base_code: '',
        flight_trip_leg_number: '',
        hotel_merchant_category_code: '',
        hotel_supplier_name: '',
        hotel_checked_in_at: undefined,
        hotel_nights: 0,
        hotel_checked_out_at: undefined,
        hotel_country: '',
        hotel_city: '',
        hotel_total_fare: 0,
        fleet_product_merchant_category_code: '',
        fleet_product_supplier_name: '',
        fleet_service_merchant_category_code: '',
        fleet_service_supplier_name: '',
        car_rental_merchant_category_code: '',
        car_rental_supplier_name: '',
        car_rental_started_at: undefined,
        car_rental_days: 0,
        car_rental_ended_at: undefined,
        general_ticket_issued_at: undefined,
        general_ticket_number: '',
        general_issuing_carrier: '',
        general_travel_agency_name: '',
        general_travel_agency_code: '',
        general_ticket_total_fare: 0,
        general_ticket_total_tax: 0,
        merchant_address: '',
      },
      org_id: 'oroLKHBYQVvj',
      post_date: null,
      spent_at: '2018-06-06T00:00:00+00:00',
      statement_id: 'stmt2K9aLunGU4',
      updated_at: '2024-02-12T12:36:16.437742+00:00',
      user: {
        email: 'devendra.r@fyle.in',
        full_name: 'Devendra Singh Rana',
        id: 'usvMoPfCC9Xw',
      },
      user_id: 'usvMoPfCC9Xw',
      transaction_status: TransactionStatus.PENDING,
    },
  ],
});
