export interface ExtendedComment {
  comment: string;
  created_at: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_data?: any;
  creator_user: {
    id: string;
    email: string;
    full_name: string;
  };
  creator_user_id: string;
  id: string;
  isSelfComment?: boolean;
  isBotComment?: boolean;
  isOthersComment?: boolean;
  show_dt?: boolean;
}
