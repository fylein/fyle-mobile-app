export interface CCCExpUnflattened {
  ccce: {
    id: string;
    created_at: string;
    updated_at: string;
    txn_dt: string;
    creator_id: string | number;
    orig_currency: string;
    orig_amount: number;
    currency: string;
    amount: number;
    description: string;
    vendor: string;
    payment_id: string;
    state: string;
    group_id: string;
    card_or_account_number: string;
    corporate_credit_card_account_number?: string;
  };
  personal: boolean;
  matched: {
    by: string;
    at: Date;
  };
  tx: {
    split_group_id: string;
    split_group_user_amount: number;
    project_id: string;
  };
  reversed: boolean;
  bank: {
    txn_id: string;
  };
  ou: {
    id: string;
    org_id: string;
    department_id: string;
  };
  us: {
    full_name: string;
    email: string;
  };
  flow?: string;
  org_category_id?: number;
}

export interface CCCExpense {
  id: string;
  created_at: string;
  updated_at: string;
  displayObject?: string;
  txn_dt: string;
  creator_id: string | number;
  orig_currency: string;
  orig_amount: number;
  currency: string;
  amount: number;
  description: string;
  vendor: string;
  payment_id: string;
  state: string;
  group_id: string;
  card_or_account_number: string;
  corporate_credit_card_account_number?: string;
}
