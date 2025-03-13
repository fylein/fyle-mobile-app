export interface Comment {
  comment: string;
  created_at: Date;
  creator_user: {
    id: string;
    email: string;
    full_name: string;
  };
  creator_user_id: string;
  id: string;
  userTimezone?: string;
}
