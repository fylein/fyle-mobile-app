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
  };
}
