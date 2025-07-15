export interface Comment {
  comment: string;
  created_at: Date;
  creator_type: 'USER' | 'POLICY' | 'SYSTEM';
  creator_user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
  creator_user_id: string | null;
  id: string;
}
