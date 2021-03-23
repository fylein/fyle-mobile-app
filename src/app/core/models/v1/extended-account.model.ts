export interface ExtendedAccount {
  acc: {
    category: string;
    created_at: Date;
    currency: string;
    current_balance_amount: number;
    id: string;
    name: string;
    target_balance_amount: number;
    tentative_balance_amount: number;
    type: string;
    updated_at: Date;
    displayName?: string;
    isReimbursable?: boolean;
  };
  advance: {
    id: string;
    number: string;
    purpose: string;
  };
  amount: number;
  currency: string;
  org: {
    id: string;
    domain: string;
  };
  orig: {
    amount: number;
    currency: string;
  };
  ou: {
    id: string;
    org_id: string;
  };
  us: {
    email: string;
    full_name: string;
  };
}
