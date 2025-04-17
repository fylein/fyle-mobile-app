export interface ExpenseComment {
  comment: string;
  action: string;
  id: string;
  expense_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_data?: any;
  updated_at: string;
  created_at: string;
  org_id: string;
  creator_type: 'USER' | 'POLICY' | 'SYSTEM';
  creator_user_id: string | null;
  creator_user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}
