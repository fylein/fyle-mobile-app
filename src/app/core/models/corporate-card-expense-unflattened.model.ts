export interface CCCExpUnflattened {
  ccce: {
    id: string;
    created_at: Date;
    updated_at: Date;
    txn_dt: Date;
    creator_id: string;
    orig_currency: string;
    orig_amount: number;
    currency: string;
    amount: number;
    description: string;
    vendor: string;
    payment_id: string;
    settlement_id: string;
    state: string;
    group_id: string;
    card_or_account_number: string;
    balance_transfer_id: string;
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
  balance: {
    transfer_settlement_id: string;
  };
}
