import { TransactionStatus } from './expense.model';

interface CorporateCard {
  id: string;
  bank_name: string;
  card_number: string;
  masked_number: string;
  user_full_name: string;
  user_email: string;
}

interface AssignorUser {
  id: string;
  email: string;
  full_name: string;
}

interface MatchedExpense {
  id: string;
  currency: string;
  amount: number;
  spent_at: Date;
  merchant: string;
  foreign_currency: string;
  foreign_amount: number;
  purpose: string;
  state: string;
  seq_num: string;
  no_of_files: number;
  category_display_name: string;
}

interface Metadata {
  merchant_category_code: string;
  flight_merchant_category_code: string;
  flight_supplier_name: string;
  flight_travel_agency_name: string;
  flight_ticket_number: string;
  flight_total_fare: number;
  flight_travel_date: Date;
  flight_service_class: string;
  flight_carrier_code: string;
  flight_fare_base_code: string;
  flight_trip_leg_number: string;
  hotel_merchant_category_code: string;
  hotel_supplier_name: string;
  hotel_checked_in_at: Date;
  hotel_nights: number;
  hotel_checked_out_at: Date;
  hotel_country: string;
  hotel_city: string;
  hotel_total_fare: number;
  fleet_product_merchant_category_code: string;
  fleet_product_supplier_name: string;
  fleet_service_merchant_category_code: string;
  fleet_service_supplier_name: string;
  car_rental_merchant_category_code: string;
  car_rental_supplier_name: string;
  car_rental_started_at: Date;
  car_rental_days: number;
  car_rental_ended_at: Date;
  general_ticket_issued_at: Date;
  general_ticket_number: string;
  general_issuing_carrier: string;
  general_travel_agency_name: string;
  general_travel_agency_code: string;
  general_ticket_total_fare: number;
  general_ticket_total_tax: number;
  merchant_address: string;
}

interface corporateCardTransactionData {
  id: string;
  org_id: string;
  user_id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  created_at: Date;
  updated_at: Date;
  amount: number;
  currency: string;
  spent_at: Date;
  post_date: Date;
  description: string;
  statement_id: string;
  can_delete: boolean;
  foreign_currency: string;
  foreign_amount: number;
  code: string;
  merchant: string;
  mcc: string;
  category: string;
  corporate_card_id: string;
  corporate_card: CorporateCard;
  assignor_user_id: string;
  assignor_user: AssignorUser;
  is_assigned: boolean;
  last_assigned_at: Date;
  is_marked_personal: boolean;
  last_marked_personal_at: Date;
  is_dismissed: boolean;
  is_exported: boolean;
  last_dismissed_at: Date;
  is_auto_matched: boolean;
  auto_suggested_expense_ids: string[];
  last_auto_matched_at: Date;
  matched_expense_ids: string[];
  matched_expenses: MatchedExpense[];
  last_user_matched_at: Date;
  settlement_id: string;
  metadata?: Metadata;
  transaction_status?: TransactionStatus;
}

export interface CorporateCardTransactionRes {
  data: corporateCardTransactionData;
}
