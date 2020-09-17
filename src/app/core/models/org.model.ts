export interface Org {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  domain: string;
  currency: string;
  branch_ifsc: string;
  branch_account: string;
  tally_bank_ledger?: any;
  tally_default_category?: any;
  tally_default_user?: any;
  corporate_credit_card_details: {
    bank_name?: any;
    number_of_cards?: any;
  };
  verified: boolean;
  lite: boolean;
  dwolla_customers_metadata_id?: any;
}
